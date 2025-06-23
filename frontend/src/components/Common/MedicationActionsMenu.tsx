import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { MedicationPublic } from "@/client"
import EditMedication from "../Medications/EditMedication"
import DeleteMedication from "../Medications/DeleteMedication"
import ManageMedicationPatients from "../Medications/ManageMedicationPatients"

interface MedicationActionsMenuProps {
  medication: MedicationPublic
}

export const MedicationActionsMenu = ({ medication }: MedicationActionsMenuProps) => (
  <MenuRoot>
    <MenuTrigger asChild>
      <IconButton variant="ghost" color="inherit">
        <BsThreeDotsVertical />
      </IconButton>
    </MenuTrigger>
    <MenuContent>
      <EditMedication medication={medication} />
      <ManageMedicationPatients medication={medication} />
      <DeleteMedication id={medication.id} />
    </MenuContent>
  </MenuRoot>
) 