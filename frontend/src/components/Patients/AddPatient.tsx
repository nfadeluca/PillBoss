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

import { type PatientCreate, PatientsService } from "@/client"
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

const AddPatient = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PatientCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      first_name: "",
      last_name: "",
      age: 0,
      height_cm: 0,
      weight_kg: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PatientCreate) =>
      PatientsService.createPatient({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Patient created successfully.")
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

  const onSubmit: SubmitHandler<PatientCreate> = (data) => {
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
        <Button value="add-patient" my={4}>
          <FaPlus fontSize="16px" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new patient.</Text>
            <VStack gap={4}>
              <HStack w="full">
                <Field
                  required
                  invalid={!!errors.first_name}
                  errorText={errors.first_name?.message}
                  label="First Name"
                >
                  <Input
                    id="first_name"
                    {...register("first_name", {
                      required: "First name is required.",
                    })}
                    placeholder="First Name"
                    type="text"
                  />
                </Field>
                <Field
                  required
                  invalid={!!errors.last_name}
                  errorText={errors.last_name?.message}
                  label="Last Name"
                >
                  <Input
                    id="last_name"
                    {...register("last_name", {
                      required: "Last name is required.",
                    })}
                    placeholder="Last Name"
                    type="text"
                  />
                </Field>
              </HStack>

              <HStack w="full">
                <Field
                  required
                  invalid={!!errors.age}
                  errorText={errors.age?.message}
                  label="Age"
                >
                  <Input
                    id="age"
                    {...register("age", {
                      required: "Age is required.",
                      valueAsNumber: true,
                    })}
                    placeholder="Age"
                    type="number"
                  />
                </Field>
                <Field
                  required
                  invalid={!!errors.height_cm}
                  errorText={errors.height_cm?.message}
                  label="Height (cm)"
                >
                  <Input
                    id="height_cm"
                    {...register("height_cm", {
                      required: "Height is required.",
                      valueAsNumber: true,
                    })}
                    placeholder="Height in cm"
                    type="number"
                  />
                </Field>
                <Field
                  required
                  invalid={!!errors.weight_kg}
                  errorText={errors.weight_kg?.message}
                  label="Weight (kg)"
                >
                  <Input
                    id="weight_kg"
                    {...register("weight_kg", {
                      required: "Weight is required.",
                      valueAsNumber: true,
                    })}
                    placeholder="Weight in kg"
                    type="number"
                  />
                </Field>
              </HStack>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddPatient 