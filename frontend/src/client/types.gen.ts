// This file is auto-generated by @hey-api/openapi-ts

export type Body_login_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type ItemCreate = {
  title: string
  description?: string | null
}

export type ItemPublic = {
  title: string
  description?: string | null
  id: string
  owner_id: string
}

export type ItemsPublic = {
  data: Array<ItemPublic>
  count: number
}

export type ItemUpdate = {
  title?: string | null
  description?: string | null
}

export type Message = {
  message: string
}

export type NewPassword = {
  token: string
  new_password: string
}

export type PrivateUserCreate = {
  email: string
  password: string
  full_name: string
  is_verified?: boolean
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserCreate = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password: string
}

export type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  id: string
}

export type UserRegister = {
  email: string
  password: string
  full_name?: string | null
}

export type UsersPublic = {
  data: Array<UserPublic>
  count: number
}

export type UserUpdate = {
  email?: string | null
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password?: string | null
}

export type UserUpdateMe = {
  full_name?: string | null
  email?: string | null
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type ItemsReadItemsData = {
  limit?: number
  skip?: number
}

export type ItemsReadItemsResponse = ItemsPublic

export type ItemsCreateItemData = {
  requestBody: ItemCreate
}

export type ItemsCreateItemResponse = ItemPublic

export type ItemsReadItemData = {
  id: string
}

export type ItemsReadItemResponse = ItemPublic

export type ItemsUpdateItemData = {
  id: string
  requestBody: ItemUpdate
}

export type ItemsUpdateItemResponse = ItemPublic

export type ItemsDeleteItemData = {
  id: string
}

export type ItemsDeleteItemResponse = Message

export type LoginLoginAccessTokenData = {
  formData: Body_login_login_access_token
}

export type LoginLoginAccessTokenResponse = Token

export type LoginTestTokenResponse = UserPublic

export type LoginRecoverPasswordData = {
  email: string
}

export type LoginRecoverPasswordResponse = Message

export type LoginResetPasswordData = {
  requestBody: NewPassword
}

export type LoginResetPasswordResponse = Message

export type LoginRecoverPasswordHtmlContentData = {
  email: string
}

export type LoginRecoverPasswordHtmlContentResponse = string

export type PrivateCreateUserData = {
  requestBody: PrivateUserCreate
}

export type PrivateCreateUserResponse = UserPublic

export type UsersReadUsersData = {
  limit?: number
  skip?: number
}

export type UsersReadUsersResponse = UsersPublic

export type UsersCreateUserData = {
  requestBody: UserCreate
}

export type UsersCreateUserResponse = UserPublic

export type UsersReadUserMeResponse = UserPublic

export type UsersDeleteUserMeResponse = Message

export type UsersUpdateUserMeData = {
  requestBody: UserUpdateMe
}

export type UsersUpdateUserMeResponse = UserPublic

export type UsersUpdatePasswordMeData = {
  requestBody: UpdatePassword
}

export type UsersUpdatePasswordMeResponse = Message

export type UsersRegisterUserData = {
  requestBody: UserRegister
}

export type UsersRegisterUserResponse = UserPublic

export type UsersReadUserByIdData = {
  userId: string
}

export type UsersReadUserByIdResponse = UserPublic

export type UsersUpdateUserData = {
  requestBody: UserUpdate
  userId: string
}

export type UsersUpdateUserResponse = UserPublic

export type UsersDeleteUserData = {
  userId: string
}

export type UsersDeleteUserResponse = Message

export type UtilsTestEmailData = {
  emailTo: string
}

export type UtilsTestEmailResponse = Message

export type UtilsHealthCheckResponse = boolean

export type PatientCreate = {
  first_name: string
  last_name: string
  age: number
  height_cm: number
  weight_kg: number
}

export type PatientUpdate = {
  first_name?: string | null
  last_name?: string | null
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | null
}

export type PatientPublic = {
  first_name: string
  last_name: string
  age: number
  height_cm: number
  weight_kg: number
  id: string
  owner_id: string
}

export type PatientsPublic = {
  data: Array<PatientPublic>
  count: number
}

export type PatientsReadPatientsData = {
  limit?: number
  skip?: number
}

export type PatientsReadPatientsResponse = PatientsPublic

export type PatientsCreatePatientData = {
  requestBody: PatientCreate
}

export type PatientsCreatePatientResponse = PatientPublic

export type PatientsReadPatientData = {
  id: string
}

export type PatientsReadPatientResponse = PatientPublic

export type PatientsUpdatePatientData = {
  id: string
  requestBody: PatientUpdate
}

export type PatientsUpdatePatientResponse = PatientPublic

export type PatientsDeletePatientData = {
  id: string
}

export type PatientsDeletePatientResponse = Message

export type MedicationCreate = {
  brand_name: string
  generic: string
  dose_mg: number
  cost_usd: number
}

export type MedicationUpdate = {
  brand_name?: string | null
  generic?: string | null
  dose_mg?: number | null
  cost_usd?: number | null
}

export type MedicationPublic = {
  brand_name: string
  generic: string
  dose_mg: number
  cost_usd: number
  id: string
  owner_id: string
}

export type MedicationsPublic = {
  data: Array<MedicationPublic>
  count: number
}

export type MedicationsReadMedicationsData = {
  limit?: number
  skip?: number
}

export type MedicationsReadMedicationsResponse = MedicationsPublic

export type MedicationsCreateMedicationData = {
  requestBody: MedicationCreate
}

export type MedicationsCreateMedicationResponse = MedicationPublic

export type MedicationsReadMedicationData = {
  id: string
}

export type MedicationsReadMedicationResponse = MedicationPublic

export type MedicationsUpdateMedicationData = {
  id: string
  requestBody: MedicationUpdate
}

export type MedicationsUpdateMedicationResponse = MedicationPublic

export type MedicationsDeleteMedicationData = {
  id: string
}

export type MedicationsDeleteMedicationResponse = Message
