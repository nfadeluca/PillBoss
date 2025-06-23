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
import type { PatientPublic, MedicationsPublic, MedicationPublic } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { FiPlus, FiMinus } from "react-icons/fi";

interface ManagePatientMedicationsProps {
  patient: PatientPublic;
}

const fetchPatientMeds = async (patientId: string): Promise<MedicationsPublic> => {
  return httpRequest(OpenAPI, {
    method: "GET",
    url: `/api/v1/patients/${patientId}/medications`,
  });
};

const assignMedication = async (patientId: string, medicationId: string) => {
  return httpRequest(OpenAPI, {
    method: "POST",
    url: `/api/v1/patients/${patientId}/medications/${medicationId}`,
  });
};

const unassignMedication = async (patientId: string, medicationId: string) => {
  return httpRequest(OpenAPI, {
    method: "DELETE",
    url: `/api/v1/patients/${patientId}/medications/${medicationId}`,
  });
};

const ManagePatientMedications = ({ patient }: ManagePatientMedicationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string | "">("");
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const { data: patientMeds } = useQuery({
    queryKey: ["patient-meds", patient.id],
    queryFn: () => fetchPatientMeds(patient.id),
    enabled: isOpen,
  });

  const { data: allMeds } = useQuery({
    queryKey: ["medications", "all"],
    queryFn: () => httpRequest<MedicationsPublic>(OpenAPI, { method: "GET", url: "/api/v1/medications/" }),
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (medId: string) => assignMedication(patient.id, medId),
    onSuccess: () => {
      showSuccessToast("Medication assigned");
    },
    onError: () => showErrorToast("Failed to assign medication"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-meds", patient.id] });
      queryClient.invalidateQueries({ queryKey: ["medications", "all"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (medId: string) => unassignMedication(patient.id, medId),
    onSuccess: () => showSuccessToast("Medication removed"),
    onError: () => showErrorToast("Failed to remove medication"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["patient-meds", patient.id] }),
  });

  const availableMeds: MedicationPublic[] =
    allMeds?.data.filter((m) => !patientMeds?.data.some((pm) => pm.id === m.id)) ?? [];

  const handleAssign = () => {
    if (selectedMedId) {
      assignMutation.mutate(selectedMedId as string);
      setSelectedMedId("");
    }
  };

  return (
    <DialogRoot size={{ base: "xs", md: "md" }} placement="center" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FiPlus /> Manage Medications
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Medications for {patient.first_name} {patient.last_name}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <HStack>
              <select style={{ flex: 1 }} value={selectedMedId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMedId(e.target.value)}>
                <option value="">Select medication</option>
                {availableMeds.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.brand_name} ({med.dose_mg}mg)
                  </option>
                ))}
              </select>
              <Button onClick={handleAssign} disabled={!selectedMedId || assignMutation.isPending} loading={assignMutation.isPending}>
                Add
              </Button>
            </HStack>
            <Text fontWeight="bold">Current Medications</Text>
            <Table.Root size={{ base: "sm", md: "sm" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Brand</Table.ColumnHeader>
                  <Table.ColumnHeader>Generic</Table.ColumnHeader>
                  <Table.ColumnHeader>Dose</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {patientMeds?.data.map((med) => (
                  <Table.Row key={med.id}>
                    <Table.Cell>{med.brand_name}</Table.Cell>
                    <Table.Cell>{med.generic}</Table.Cell>
                    <Table.Cell>{med.dose_mg} mg</Table.Cell>
                    <Table.Cell>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label="Remove"
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(med.id)}
                      >
                        <FiMinus />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {patientMeds?.data.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      <Text textAlign="center" color="gray.500">No medications assigned.</Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="subtle" colorPalette="gray" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ManagePatientMedications; 