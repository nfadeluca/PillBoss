import { useState } from "react";
import * as React from "react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Button,
  Table,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request as httpRequest } from "@/client/core/request";
import { OpenAPI } from "@/client/core/OpenAPI";
import type { MedicationPublic, PatientsPublic, PatientPublic } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { FiPlus, FiMinus } from "react-icons/fi";

interface Props {
  medication: MedicationPublic;
}

const fetchMedicationPatients = async (
  medicationId: string,
): Promise<PatientsPublic> => {
  return httpRequest(OpenAPI, {
    method: "GET",
    url: `/api/v1/medications/${medicationId}/patients`,
  });
};

const assignPatient = async (
  patientId: string,
  medicationId: string,
) => {
  return httpRequest(OpenAPI, {
    method: "POST",
    url: `/api/v1/patients/${patientId}/medications/${medicationId}`,
  });
};

const unassignPatient = async (
  patientId: string,
  medicationId: string,
) => {
  return httpRequest(OpenAPI, {
    method: "DELETE",
    url: `/api/v1/patients/${patientId}/medications/${medicationId}`,
  });
};

const fetchAllPatients = async (): Promise<PatientsPublic> => {
  return httpRequest(OpenAPI, {
    method: "GET",
    url: `/api/v1/patients/`,
  });
};

const ManageMedicationPatients = ({ medication }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | "">("");
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const { data: medicationPatients } = useQuery({
    queryKey: ["medication-patients", medication.id],
    queryFn: () => fetchMedicationPatients(medication.id),
    enabled: isOpen,
  });

  const { data: allPatients } = useQuery({
    queryKey: ["patients", "all"],
    queryFn: fetchAllPatients,
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (patientId: string) => assignPatient(patientId, medication.id),
    onSuccess: () => showSuccessToast("Patient assigned"),
    onError: () => showErrorToast("Failed to assign patient"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["medication-patients", medication.id] }),
  });

  const removeMutation = useMutation({
    mutationFn: (patientId: string) => unassignPatient(patientId, medication.id),
    onSuccess: () => showSuccessToast("Patient removed"),
    onError: () => showErrorToast("Failed to remove patient"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["medication-patients", medication.id] }),
  });

  const availablePatients: PatientPublic[] =
    allPatients?.data.filter((p) => !medicationPatients?.data.some((mp) => mp.id === p.id)) ?? [];

  const handleAssign = () => {
    if (selectedPatientId) {
      assignMutation.mutate(selectedPatientId as string);
      setSelectedPatientId("");
    }
  };

  return (
    <DialogRoot size={{ base: "xs", md: "md" }} placement="center" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FiPlus /> Manage Patients
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Patients for {medication.brand_name}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <HStack>
              <select style={{ flex: 1 }} value={selectedPatientId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPatientId(e.target.value)}>
                <option value="">Select patient</option>
                {availablePatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
              <Button disabled={!selectedPatientId || assignMutation.isPending} loading={assignMutation.isPending} onClick={handleAssign}>Add</Button>
            </HStack>
            <Text fontWeight="bold">Current Patients</Text>
            <Table.Root size={{ base: "sm", md: "sm" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>ID</Table.ColumnHeader>
                  <Table.ColumnHeader>First Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Last Name</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {medicationPatients?.data.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell>{p.id}</Table.Cell>
                    <Table.Cell>{p.first_name}</Table.Cell>
                    <Table.Cell>{p.last_name}</Table.Cell>
                    <Table.Cell>
                      <IconButton variant="ghost" size="sm" aria-label="Remove" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(p.id)}>
                        <FiMinus />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {medicationPatients?.data.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      <Text textAlign="center" color="gray.500">No patients assigned.</Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="subtle" colorPalette="gray" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ManageMedicationPatients; 