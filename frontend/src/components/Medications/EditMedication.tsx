import { Button, ButtonGroup, DialogActionTrigger, Input, Text, VStack, HStack } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import { type ApiError, type MedicationPublic, MedicationsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditMedicationProps {
  medication: MedicationPublic
}

interface MedicationUpdateForm {
  brand_name?: string
  generic?: string
  dose_mg?: number
  cost_usd?: number
}

const EditMedication = ({ medication }: EditMedicationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: medication,
  })

  const mutation = useMutation({
    mutationFn: (data: MedicationUpdateForm) =>
      MedicationsService.updateMedication({ id: medication.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Medication updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => handleError(err),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  })

  const onSubmit: SubmitHandler<MedicationUpdateForm> = (data) => mutation.mutate(data)

  return (
    <DialogRoot size={{ base: "xs", md: "md" }} placement="center" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" /> Edit Medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update medication details below.</Text>
            <VStack gap={4}>
              <HStack w="full">
                <Field label="Brand Name" invalid={!!errors.brand_name} errorText={errors.brand_name?.message}>
                  <Input id="brand_name" {...register("brand_name")} placeholder="Brand" />
                </Field>
                <Field label="Generic" invalid={!!errors.generic} errorText={errors.generic?.message}>
                  <Input id="generic" {...register("generic")} placeholder="Generic" />
                </Field>
              </HStack>
              <HStack w="full">
                <Field label="Dose (mg)" invalid={!!errors.dose_mg} errorText={errors.dose_mg?.message}>
                  <Input id="dose_mg" type="number" {...register("dose_mg", { valueAsNumber: true })} placeholder="Dose" />
                </Field>
                <Field label="Cost (USD)" invalid={!!errors.cost_usd} errorText={errors.cost_usd?.message}>
                  <Input id="cost_usd" type="number" step="0.01" {...register("cost_usd", { valueAsNumber: true })} placeholder="Cost" />
                </Field>
              </HStack>
            </VStack>
          </DialogBody>
          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>Cancel</Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>Save</Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditMedication 