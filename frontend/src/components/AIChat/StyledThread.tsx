import {
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  ContentPartPrimitive,
} from "@assistant-ui/react";
import { FC, PropsWithChildren } from "react";
import { FiSend } from "react-icons/fi";

// Simple tooltipless icon button (replace with your own design system if desired)
const IconButton: FC<PropsWithChildren<{ onClick?: () => void; className?: string }>> = ({
  onClick,
  className = "",
  children,
}) => (
  <button
    onClick={onClick}
    className={`aui-button aui-button-primary aui-button-icon aui-composer-send ${className}`}
    type="button"
  >
    {children}
  </button>
);

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="aui-user-message-root">
    <div className="aui-user-message-content">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="aui-assistant-message-root">
    <div className="aui-assistant-message-content">
      <MessagePrimitive.Content
        components={{
          Text: FancyText,
        }}
      />
    </div>
  </MessagePrimitive.Root>
);

// Custom Text component with animated streaming dots
const FancyText: FC<{ text: string }> = ({ text }) => (
  <p className="aui-text whitespace-pre-line">
    {text}
    <ContentPartPrimitive.InProgress>
      <span className="aui-text-running ml-1" />
    </ContentPartPrimitive.InProgress>
  </p>
);

const Composer: FC = () => (
  <ComposerPrimitive.Root className="aui-composer-root">
    <ComposerPrimitive.Input
      rows={1}
      placeholder="Write a message..."
      className="aui-composer-input"
    />
    <ComposerPrimitive.Send asChild>
      <IconButton>
        <FiSend />
      </IconButton>
    </ComposerPrimitive.Send>
  </ComposerPrimitive.Root>
);

export const StyledThread: FC = () => (
  <ThreadPrimitive.Root
    className="aui-root aui-thread-root"
    style={{ ["--thread-max-width" as string]: "42rem" }}
  >
    <ThreadPrimitive.Viewport className="aui-thread-viewport">
      <ThreadPrimitive.Messages
        components={{
          UserMessage,
          AssistantMessage,
        }}
      />
      <div className="aui-thread-viewport-spacer" />
      <div className="aui-thread-viewport-footer">
        <Composer />
      </div>
    </ThreadPrimitive.Viewport>
  </ThreadPrimitive.Root>
);

export default StyledThread; 