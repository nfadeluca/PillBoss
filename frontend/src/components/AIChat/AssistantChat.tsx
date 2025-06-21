import { Box } from "@chakra-ui/react"
import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useJsonLinesChatRuntime } from "@/lib/useJsonLinesChatRuntime"
import { OpenAPI } from "@/client"
import StyledThread from "./StyledThread"

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
        <StyledThread />
      </Box>
    </AssistantRuntimeProvider>
  )
}

export default AssistantChat 