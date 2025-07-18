import { Button, DialogTitle, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiTrash2 } from "react-icons/fi"

import { MedicationsService } from "@/client"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"

const DeleteMedication = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { handleSubmit, formState: { isSubmitting } } = useForm()

  const remove = async (id: string) => {
    await MedicationsService.deleteMedication({ id })
  }

  const mutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      showSuccessToast("Medication deleted successfully")
      setIsOpen(false)
    },
    onError: () => showErrorToast("Error deleting medication"),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit = () => mutation.mutate(id)

  return (
    <DialogRoot size={{ base: "xs", md: "md" }} placement="center" role="alertdialog" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 fontSize="16px" /> Delete Medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Delete Medication</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>This medication will be permanently deleted. Are you sure?</Text>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>Cancel</Button>
            </DialogActionTrigger>
            <Button variant="solid" colorPalette="red" type="submit" loading={isSubmitting}>Delete</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteMedication 