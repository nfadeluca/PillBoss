import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { PatientsService } from "@/client"
import { PatientActionsMenu } from "@/components/Common/PatientActionsMenu"
import AddPatient from "@/components/Patients/AddPatient"
import PendingItems from "@/components/Pending/PendingItems"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const patientsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getPatientsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      PatientsService.readPatients({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["patients", { page }],
  }
}

export const Route = createFileRoute("/_layout/patients")({
  component: Patients,
  validateSearch: (search) => patientsSearchSchema.parse(search),
})

function PatientsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getPatientsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({ search: { page } })

  const patients = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingItems />
  }

  if (patients.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any patients yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new patient to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">First Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Last Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Age</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {patients?.map((patient) => (
            <Table.Row key={patient.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">{patient.id}</Table.Cell>
              <Table.Cell truncate maxW="sm">{patient.first_name}</Table.Cell>
              <Table.Cell truncate maxW="sm">{patient.last_name}</Table.Cell>
              <Table.Cell truncate maxW="sm">{patient.age}</Table.Cell>
              <Table.Cell>
                <PatientActionsMenu patient={patient} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
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

function Patients() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Patient Management
      </Heading>
      <AddPatient />
      <PatientsTable />
    </Container>
  )
}
