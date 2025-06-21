import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"

import { type MedicationCreate, MedicationsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

const AddMedication = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<MedicationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      brand_name: "",
      generic: "",
      dose_mg: 0,
      cost_usd: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: MedicationCreate) =>
      MedicationsService.createMedication({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Medication created successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => handleError(err),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  })

  const onSubmit: SubmitHandler<MedicationCreate> = (data) => mutation.mutate(data)

  return (
    <DialogRoot size={{ base: "xs", md: "md" }} placement="center" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button my={4} value="add-medication">
          <FaPlus fontSize="16px" /> Add Medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new medication.</Text>
            <VStack gap={4}>
              <HStack w="full">
                <Field required label="Brand Name" invalid={!!errors.brand_name} errorText={errors.brand_name?.message}>
                  <Input id="brand_name" {...register("brand_name", { required: "Brand name is required." })} placeholder="Brand" />
                </Field>
                <Field required label="Generic" invalid={!!errors.generic} errorText={errors.generic?.message}>
                  <Input id="generic" {...register("generic", { required: "Generic name is required." })} placeholder="Generic" />
                </Field>
              </HStack>
              <HStack w="full">
                <Field required label="Dose (mg)" invalid={!!errors.dose_mg} errorText={errors.dose_mg?.message}>
                  <Input id="dose_mg" type="number" {...register("dose_mg", { required: true, valueAsNumber: true })} placeholder="Dose" />
                </Field>
                <Field required label="Cost (USD)" invalid={!!errors.cost_usd} errorText={errors.cost_usd?.message}>
                  <Input id="cost_usd" type="number" step="0.01" {...register("cost_usd", { required: true, valueAsNumber: true })} placeholder="Cost" />
                </Field>
              </HStack>
            </VStack>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>Cancel</Button>
            </DialogActionTrigger>
            <Button variant="solid" type="submit" disabled={!isValid} loading={isSubmitting}>Save</Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddMedication 