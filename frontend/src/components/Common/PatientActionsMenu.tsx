import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { PatientPublic } from "@/client"
import DeletePatient from "../Patients/DeletePatient"
import EditPatient from "../Patients/EditPatient"

interface PatientActionsMenuProps {
  patient: PatientPublic
}

export const PatientActionsMenu = ({ patient }: PatientActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditPatient patient={patient} />
        <DeletePatient id={patient.id} />
      </MenuContent>
    </MenuRoot>
  )
} 