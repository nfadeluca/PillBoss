import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import {
  type ApiError,
  type PatientPublic,
  PatientsService,
} from "@/client"
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

interface EditPatientProps {
  patient: PatientPublic
}

interface PatientUpdateForm {
  first_name?: string
  last_name?: string
  age?: number
  height_cm?: number
  weight_kg?: number
}

const EditPatient = ({ patient }: EditPatientProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: patient,
  })

  const mutation = useMutation({
    mutationFn: (data: PatientUpdateForm) =>
      PatientsService.updatePatient({ id: patient.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Patient updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })

  const onSubmit: SubmitHandler<PatientUpdateForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Edit Patient
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update patient details below.</Text>
            <VStack gap={4}>
              <HStack w="full">
                <Field
                  invalid={!!errors.first_name}
                  errorText={errors.first_name?.message}
                  label="First Name"
                >
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    placeholder="First Name"
                    type="text"
                  />
                </Field>
                <Field
                  invalid={!!errors.last_name}
                  errorText={errors.last_name?.message}
                  label="Last Name"
                >
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    placeholder="Last Name"
                    type="text"
                  />
                </Field>
              </HStack>
              <HStack w="full">
                <Field
                  invalid={!!errors.age}
                  errorText={errors.age?.message}
                  label="Age"
                >
                  <Input
                    id="age"
                    {...register("age", { valueAsNumber: true })}
                    placeholder="Age"
                    type="number"
                  />
                </Field>
                <Field
                  invalid={!!errors.height_cm}
                  errorText={errors.height_cm?.message}
                  label="Height (cm)"
                >
                  <Input
                    id="height_cm"
                    {...register("height_cm", { valueAsNumber: true })}
                    placeholder="Height in cm"
                    type="number"
                  />
                </Field>
                <Field
                  invalid={!!errors.weight_kg}
                  errorText={errors.weight_kg?.message}
                  label="Weight (kg)"
                >
                  <Input
                    id="weight_kg"
                    {...register("weight_kg", { valueAsNumber: true })}
                    placeholder="Weight in kg"
                    type="number"
                  />
                </Field>
              </HStack>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditPatient 