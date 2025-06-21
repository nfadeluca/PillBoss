import { Box, Button } from "@chakra-ui/react"
import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  AssistantRuntimeProvider,
} from "@assistant-ui/react"
import { useJsonLinesChatRuntime } from "@/lib/useJsonLinesChatRuntime"
import { OpenAPI } from "@/client"

// Basic message renderer used for all message types
const BasicMessage = () => (
  <MessagePrimitive.Root style={{ margin: "0.5rem 0" }}>
    <MessagePrimitive.Content />
  </MessagePrimitive.Root>
)

/**
 * AssistantChat renders a full-screen AI chat powered by assistant-ui.
 * It uses the low-level primitives so you can style however you like.
 */
const AssistantChat = () => {
  const runtime = useJsonLinesChatRuntime({
    api: `${OpenAPI.BASE}/api/v1/chat`,
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Box h="full" display="flex" flexDirection="column">
        <ThreadPrimitive.Root
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <ThreadPrimitive.Viewport
            style={{ flex: 1, overflowY: "auto", padding: "1rem" }}
          >
            {/* Render all messages using the basic renderer */}
            <ThreadPrimitive.Messages components={{ Message: BasicMessage }} />
          </ThreadPrimitive.Viewport>

          {/* Composer area */}
          <ComposerPrimitive.Root
            style={{ display: "flex", borderTop: "1px solid #e2e8f0" }}
          >
            <ComposerPrimitive.Input
              placeholder="Ask me anything…"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                padding: "0.75rem",
                border: "none",
                outline: "none",
              }}
            />
            <ComposerPrimitive.Send asChild>
              <Button px={4} borderLeftRadius={0} colorScheme="blue">
                Send
              </Button>
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </Box>
    </AssistantRuntimeProvider>
  )
}

export default AssistantChat 