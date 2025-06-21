import { Container } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import AssistantChat from "@/components/AIChat/AssistantChat"

export const Route = createFileRoute("/_layout/chat")({
  component: ChatPage,
})

function ChatPage() {
  return (
    <Container maxW="full" h="100%" p={0}>
      <AssistantChat />
    </Container>
  )
} 