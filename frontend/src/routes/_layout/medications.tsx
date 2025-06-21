import { Container, EmptyState, Flex, Heading, Table, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { MedicationsService } from "@/client"
import { MedicationActionsMenu } from "@/components/Common/MedicationActionsMenu"
import AddMedication from "@/components/Medications/AddMedication"
import PendingItems from "@/components/Pending/PendingItems"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const searchSchema = z.object({ page: z.number().catch(1) })
const PER_PAGE = 5

function getQueryOpts({ page }: { page: number }) {
  return {
    queryFn: () => MedicationsService.readMedications({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["medications", { page }],
  }
}

export const Route = createFileRoute("/_layout/medications")({
  component: Medications,
  validateSearch: (s) => searchSchema.parse(s),
})

function MedsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({ ...getQueryOpts({ page }), placeholderData: (d) => d })
  const setPage = (page: number) => navigate({ search: (prev) => ({ ...prev, page }) })

  const meds = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) return <PendingItems />
  if (meds.length === 0)
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No medications yet</EmptyState.Title>
            <EmptyState.Description>Add a medication to get started</EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Brand</Table.ColumnHeader>
            <Table.ColumnHeader>Generic</Table.ColumnHeader>
            <Table.ColumnHeader>Dose (mg)</Table.ColumnHeader>
            <Table.ColumnHeader>Cost (USD)</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {meds.map((m) => (
            <Table.Row key={m.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{m.id}</Table.Cell>
              <Table.Cell>{m.brand_name}</Table.Cell>
              <Table.Cell>{m.generic}</Table.Cell>
              <Table.Cell>{m.dose_mg}</Table.Cell>
              <Table.Cell>{m.cost_usd.toFixed(2)}</Table.Cell>
              <Table.Cell>
                <MedicationActionsMenu medication={m} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot count={count} pageSize={PER_PAGE} onPageChange={({ page }) => setPage(page)}>
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Medications() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>Medications</Heading>
      <AddMedication />
      <MedsTable />
    </Container>
  )
} 