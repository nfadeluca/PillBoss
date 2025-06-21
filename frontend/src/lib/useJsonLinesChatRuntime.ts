"use client";

import {
  AssistantMessageAccumulator,
  DataStreamDecoder,
  unstable_toolResultStream,
} from "assistant-stream";
import { asAsyncIterableStream } from "assistant-stream/utils";
import {
  ChatModelAdapter,
  ChatModelRunOptions,
  ThreadMessage,
} from "@assistant-ui/react";
import { useLocalRuntime } from "@assistant-ui/react";

// Helper to convert the runtime's message structure into a simple array
// understood by our backend. This implementation mirrors the logic used
// inside assistant-ui's Edge adapter but purposefully strips out parts that
// our backend doesn't understand (reasoning, sources, files, etc.).
const toCoreMessages = (messages: readonly any[]) => {
  return messages.map((message: any) => {
    const { role } = message;
    switch (role) {
      case "assistant":
        return {
          role,
          content: message.content
            .map((part: any) => {
              if (
                part.type === "reasoning" ||
                part.type === "source" ||
                part.type === "file"
              )
                return null;
              if (part.type === "tool-call") {
                const { argsText, ...rest } = part;
                return rest;
              }
              return part;
            })
            .filter(Boolean),
        } as const;

      case "user":
        return {
          role,
          content: [
            // message.content may already include text parts
            ...message.content,
            // attachments are flattened into the main array
            ...(message.attachments ?? []).map((a: any) => a.content).flat(),
          ],
        } as const;

      case "system":
        return { role, content: message.content } as const;
      default:
        // Fallback – just forward as-is
        return { role, content: message.content } as const;
    }
  });
};

// A minimal transform that converts JSON-line encoded chunks
// {"type":"0","value":"H"}\n -> "0:{"H"}\n" (DataStream encoding)
class JsonLineToDataStreamTransformer extends TransformStream<string, string> {
  private buffer = "";
  constructor() {
    super({
      transform: (chunk, controller) => {
        this.buffer += chunk;
        let idx;
        while ((idx = this.buffer.indexOf("\n")) !== -1) {
          const line = this.buffer.slice(0, idx).trim();
          this.buffer = this.buffer.slice(idx + 1);
          if (line.length === 0) continue;
          try {
            const parsed = JSON.parse(line) as { type: string; value: any };
            const outLine = `${parsed.type}:${JSON.stringify(parsed.value)}\n`;
            controller.enqueue(outLine);
          } catch (err) {
            console.error("Failed to parse JSON line", err);
          }
        }
      },
      flush: (controller) => {
        const line = this.buffer.trim();
        if (line.length) {
          try {
            const parsed = JSON.parse(line) as { type: string; value: any };
            const outLine = `${parsed.type}:${JSON.stringify(parsed.value)}\n`;
            controller.enqueue(outLine);
          } catch (err) {
            console.error("Failed to parse JSON line on flush", err);
          }
        }
      },
    });
  }
}

export interface JsonLinesModelAdapterOptions {
  api: string;
  headers?: HeadersInit | (() => Promise<HeadersInit>);
  credentials?: RequestCredentials;
  body?: object;
  onResponse?: (response: Response) => void | Promise<void>;
  onFinish?: (message: ThreadMessage) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  unstable_sendMessageIds?: boolean;
  sendExtraMessageFields?: boolean;
}

export class JsonLinesModelAdapter implements ChatModelAdapter {
  constructor(private options: JsonLinesModelAdapterOptions) {}

  async *run({
    messages,
    runConfig,
    abortSignal,
    context,
    unstable_assistantMessageId,
    unstable_getMessage,
  }: ChatModelRunOptions) {
    const headersValue =
      typeof this.options.headers === "function"
        ? await this.options.headers()
        : this.options.headers;

    abortSignal.addEventListener(
      "abort",
      () => {
        if (!abortSignal.reason?.detach) this.options.onCancel?.();
      },
      { once: true },
    );

    const headers = new Headers(headersValue);
    headers.set("Content-Type", "application/json");

    const result = await fetch(this.options.api, {
      method: "POST",
      headers,
      credentials: this.options.credentials ?? "same-origin",
      body: JSON.stringify({
        system: context.system,
        messages: toCoreMessages(messages),
        unstable_assistantMessageId,
        runConfig,
        // Forward any extra state / settings we get
        state: unstable_getMessage().metadata.unstable_state,
        ...context.callSettings,
        ...context.config,
        ...this.options.body,
      }),
      signal: abortSignal,
    });

    await this.options.onResponse?.(result);

    if (!result.ok) {
      const errText = await result.text();
      throw new Error(`Status ${result.status}: ${errText}`);
    }
    if (!result.body) {
      throw new Error("Response body is null");
    }

    const transformedStream = result.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new JsonLineToDataStreamTransformer())
      .pipeThrough(new TextEncoderStream())
      .pipeThrough(new DataStreamDecoder())
      .pipeThrough(unstable_toolResultStream(context.tools, abortSignal))
      .pipeThrough(new AssistantMessageAccumulator());

    yield* asAsyncIterableStream(transformedStream);
    this.options.onFinish?.(unstable_getMessage());
  }
}

export const useJsonLinesChatRuntime = (options: JsonLinesModelAdapterOptions) => {
  // @ts-expect-error – the LocalRuntime type isn't exported publicly, but the shape is compatible.
  return useLocalRuntime(new JsonLinesModelAdapter(options), options);
}; 