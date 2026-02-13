import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface Maintenance {
  key: string;
  value: string;
}

export interface MenuItem {
  name: string;
  href: string;
  icon?: string;
  isTitle?: boolean;
  key?: string;
}

export interface PEAProfile {
  code: string;
  prefix: string;
  first_name: string;
  last_name: string;
  job_position: string;
  affiliated: string;
  phone: string;
  email: string;
}

export interface NewsItem {
  uuid: number | null;
  title: string;
  description: string;
  content: string;
  publishDateStart: string;
  publishDateEnd: string;
  isNew: boolean; // Changed from is_new to isNew to match backend response (camelCase)
  updatedAt?: string;
  coverImageFile?: {
    mediaType: string;
    originalName: string;
    url: string;
    uuid: string;
  };
}

export interface Pagination {
  limit: number;
  page: number;
  totalCount: number;
}

export interface Options {
  label: string;
  value: string | number;
  subOptions?: Options[];
  description?: string;
  data?: any;
}

export interface MaterialEquipmentObj {
  code: string;
  uuid: string;
  id: number;
  quantity: number | string;
  size?: string;
  unit: string;
  name: string;
  price?: number | string;
  equipmentId?: string;
  equipmentAmount?: string | number;
  unitPrice?: string | number;
  availableStock?: number;
  isActive: boolean;
  isUpdate: boolean;
  isEdited: boolean;

  materialSetUuid?: string;
  originalId?: number;
}

export interface MaterialSetItem {
  id: number;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  isActive: boolean;
  price: number;
  availableStock?: number;
}

export interface MaterialSet {
  uuid: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  materialAndEquipment: MaterialSetItem[];
}

export interface MaterialSetsResponse {
  items: MaterialSet[];
}

export interface MaterialMaster {
  id: number;
  code: string;
  name: string;
  unit: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface MeterEquipmentService {
  id: string;
  services_id: string;
  item_slug: string;
  item_name: string;
  item_description: string | null;
  option_title: string;
  sub_id: string | null;
  order: number;
  is_other: boolean;
  is_active: boolean;
  is_del: boolean;
  created_date: string;
  created_by: string;
  updated_date: string | null;
  updated_by: string | null;
}

export interface TransformerMaterialEquipmentObj {
  code: string;
  uuid: string;
  id: number;
  quantity: number | string;
  unit: string;
  name: string;
  phase: string;
  type: string;
  size: string;
  pressure: string;
  serial: string;
  price?: number | string;
  isActive: boolean;
  isUpdate: boolean;
  isEdited: boolean;
}

export interface Execution {
  id: string;
  workOrderId: string;
  startDateTime: string | Date | undefined;
  endDateTime: string | Date | undefined;
  note: string;
  username: string;
  userType: string;
  executionDetail: string;
  createdAt: string;
  serviceSpecificData: ServiceSpecificData;
  images: UploaddedImage[];
  attachments: UploadedFile[];
  startWorkDate?: string;
  endWorkDate?: string;
  latitude?: number;
  longitude?: number;
  executionNote?: string;
  serviceSatisfaction?: number;
  satisfactionComment?: string;
  readonly recorderName?: string;
  readonly recorderPosition?: string;
  readonly recorderPhoneNumber?: string;
  recorderSignature?: string;
  customerSignature?: string;
}

export type SystemLogObj = {
  id: string;
  uuid: string;
  createdAt: string;
  logType: systemLogType;
  userFirstName: string;
  userLastName: string;
  userProfileImageUrl: string;
  detail: string;
  old_detail: string;
  ipAddress: string;
  attributeName: string;
  fromValue: string;
  toValue: string;
  requestNo: string;
};

export type systemLogType =
  "error"
  | "info"
  | "warning"
  | "critical"
  | "debug"
  | "notice"
  | "success"
  | "updated"
  | "caution"

export type WorkOrderObj = {
  id: string;
  requestCode: string;
  workOrderNo: string;
  customerName: string;
  customerRequestNo?: string;
  customerMobileNo: string;
  customerAddress: string;
  customerEmail: string;
  customerBp: string;
  customerCa: string;
  customerLatitude: number;
  customerLongitude: number;
  requestServiceDetail: RequestServiceDetail | string;
  serviceSpecificData?: ServiceSpecificData;
  businessTypeId: string;
  businessTypeName: string;
  assignees: Assignee[];
  participants: Assignee[];
  appointmentDate: Date | string | undefined;
  sapProcessCreatedDate: Date | string | undefined;
  workOrderStatusCode: string;
  workOrderStatusName: string;
  statusCode: string;
  isSurvey: boolean;
  equipments: MaterialEquipmentObj[];
  priority: number;
  workDescription: string;
  mainWorkCenterId: string;
  mainWorkCenterName: string;
  costCenter: string;
  peaOffice: string;
  peaOfficeCode?: string;
  peaOfficeName?: string;
  officePlant: string;
  peaNameFull: string;
  mainWorkOrder: MainWorkOrder;
  results: {
    id: string;
    workOrderNo: string;
  }[];
  executionNote: string;
  latitude: number;
  longitude: number;
  startWorkDate: Date | undefined | string;
  endWorkDate: Date | undefined | string;
  execution: Execution;
  images: number[];
  attachments: number[];
  serviceSatisfaction: number;
  satisfactionComment: string;
  customerSignatureBase64: string;
  recorderName: string;
  recorderPosition: string;
  recorderPhoneNumber: string;
  recorderSignatureBase64: string;
  workTypeName: string;
  workType: string;
  requestSapNo: string | number;
  sapOrderNo: string;
  serviceGroupName: string;
  serviceName: string;
  createdAt: string;
  requestChannel: string;
  requestDate: string;
  workOrderType: string;
  defaultActivityPmCode: string;

  sheetType: sting;
  serviceType: string;
  serviceTypes: string[];
  organization: string[];
  order_no: string | number;
  request_no: string | number;
  request_sap_no: string | number;
  request_type: string;
  request_status: string;
  payment_received_date: string;
  pea_office: string;
  plant_code: string;
  cost_center: string;
  customer_info: Customer;
  electrical: Electrical[];
  // equipments: Equipments[];
  workers: WorkerObj[];
  insulators: Insulator[];
  // transformer: Transformer[];
  meterequipment: MeterEquipment[];
  materialEquipments?: MaterialEquipmentObj[];
  workCategory: string
  activityPmId: string
  isSms: boolean
  sapStatusCodes?: string
};

export interface MainWorkOrderRelation {
  id: string;
  workOrderNo: string;
  workOrderStatusCode: string;
  customerRequestNo: string;
  customerName: string;
  customerBp: string;
  customerCa: string;
  customerMobileNo: string;
  customerAddress: string;
  workOrderCreateDate: string;
  businessTypeName: string;
  peaOffice: string;
}

export interface SubWorkOrderRelation {
  id: string;
  workOrderNo: string;
  workOrderStatusCode: string;
  peaOffice: string;
  workOrderCreateDate: string;
  businessTypeName?: string;
}

export interface WorkOrderRelation {
  mainWorkOrder: MainWorkOrderRelation;
  subWorkOrders: SubWorkOrderRelation[];
  totalSubWorkOrders: number;
}

export interface MainWorkOrder {
  id: string;
  peaOffice: string;
  workOrderNo: string;
  officePlant: string;
  costCenter: string;
  peaNameFull: string;
  serviceName: string;
}

interface RequestServiceItem {
  item_id: string;
  quantity: number | string;
  isUpdate?: boolean;
  isEdited?: boolean;
}

type Assignee = {
  id: number;
  Id?: number;
  index?: number;
  name: string;
  username: string;
  userType: string;
  workCenterId: string;
  workUnit: string;
  workActivityTypeId: string;
  workHours: number | string;
  workOrderId?: string;
  sequenceNo?: number;
  isRead?: boolean;
  isEquipmentResponsible?: boolean;
  isUpdate?: boolean;
  isEdited?: boolean;
  activity: string;
  mainWorkCenter: string;
  startDatetime: string | Date | undefined;
  endDatetime: string | Date | undefined;
  workcenterCode?: string;
};

type Customer = {
  customer_name: string;
  customer_mobile_no: string;
  customer_address: string;
  customer_bp: string;
  customer_ca: string;
  customer_latitude: string;
  customer_longitude: string;
  customer_email: string;
};

type Electrical = {
  id: number;
  name: string;
  size?: string;
  quantity: number;
  isUpdate?: boolean;
  isEdited: boolean;
};

type Equipments = {
  id: number;
  name: string;
  equipmentId: string;
  equipmentAmount: string | number;
  unitPrice: number;
  totalPrice: number;
  isUpdate?: boolean;
  isEdited: boolean;
};

export type ElectricalEquipment = {
  id: number;
  name: string;
  quantity: number;
  isUpdate?: boolean;
  isEdited: boolean;
};

export type Transformer = {
  id: number;
  title: string;
  phase: string;
  type: string;
  serial: string;
  size: string;
  voltage: string;
  isUpdate?: boolean;
  isEdited?: boolean;
};

export type Insulator = {
  id: number;
  item_title: string;
  quantity: number;
  isUpdate?: boolean;
  isEdited?: boolean;
};

interface MeterEquipmentServiceItem {
  item_id: string;
  item_size: number;
  quantity: number;
  price: number;
}

export type MeterEquipment = {
  id: number | string;
  equipment_id?: string;
  equipment_name: string;
  size: string | number;
  quantity: number;
  price?: number;
  isUpdate?: boolean;
  isEdited?: boolean;
};

export interface DashboardSummary {
  total: number;
  completed: number;
  inProgress: number;
  cancelled: number;
  pending: number;
  completionRate: number;
}

export interface MonthlyData {
  month: number;
  monthName: string;
  weekLabel: string;
  created: number;
  completed: number;
  peaEmployeeCount: number;
  peaEmployeeHours: number;
  vendorCount: number;
  vendorHours: number;
  avgHoursPerPerson: number;
  avgHoursPerDay: number;
}

export interface DailyData {
  date: string;
  created: number;
  completed: number;
  peaEmployeeCount: number;
  peaEmployeeHours: number;
  vendorCount: number;
  vendorHours: number;
  avgHoursPerPerson: number;
  avgHoursPerDay: number;
}

export interface WeekDayData {
  date: string;
  dayName: string;
  created: number;
  completed: number;
  peaEmployeeCount: number;
  peaEmployeeHours: number;
  vendorCount: number;
  vendorHours: number;
  avgHoursPerPerson: number;
  avgHoursPerDay: number;
}

export interface WeekInMonth {
  weekLabel: string;
  created: number;
  completed: number;
  peaEmployeeCount: number;
  peaEmployeeHours: number;
  vendorCount: number;
  vendorHours: number;
  avgHoursPerPerson: number;
  avgHoursPerDay: number;
}

export interface QuarterlyData {
  quarter: number;
  quarterName: string;
  created: number;
  completed: number;
  peaEmployeeCount: number;
  peaEmployeeHours: number;
  vendorCount: number;
  vendorHours: number;
  avgHoursPerPerson: number;
  avgHoursPerDay: number;
}

export interface WorkHours {
  totalHours: number;
  peaEmployeeHours: number;
  vendorHours: number;
}

export interface DashboardObj {
  year: number;
  view: string;
  summary: DashboardSummary;
  monthlyData: MonthlyData[];
  dailyData?: DailyData;
  weeklyData?: WeekDayData[];
  weeksInMonth?: WeekInMonth[];
  quarterlyData?: QuarterlyData[];
  workHours: WorkHours;
}

type WorkerObj = {
  isUpdate?: boolean;
  isEdited: boolean;
  group: string;
  operation_center: string;
  id: number;
  hours: number;
  unit: string;
  worker_id?: string;
  worker: string;
  event: string;
  group_worker: string;
};

interface User {
  department: string;
  email: string;
  username: string;
  employeeCode: string;
  selectedPeaOffice: string;
  firstName: string;
  lastName: string;
  phoneNumber: null | string;
  position: null | string;
  prefix: null | string;
  profileImageUrl: null | string;
  signatureImageUrl: null | string;
  signatureType: null | string;
  type: string; //VENDOR_USER | WOM_USER
  uuid: string;
  profileImage: string | null;
  signatureImage: string | null;  
}

export interface MaterialOptionObj {
  id: number;
  code: string; //รหัสวัสดุ
  name: string; //ชื่อวัสดุ
  unit: string; //หน่วย
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean; // Optional เพราะ API ไม่ส่งมา
}

export interface PeaOfficeObj {
  regiongroup: string;
  office: string;
  peaNameFull: string;
}

export interface SubServiceType {
  // children: []
  detail: string;
  id: string;
  name: string;
  priority: number;
  requestCode: string;
  requestTypeCode: string;
  type: string;
}

export interface ServiceType {
  id: string;
  name: string;
  services: SubServiceType[];
}

export interface SubPeaOrganize {
  id: string;
  level: string;
  name: string;
  office: string;
  regiongroup: string;
  children?: SubPeaOrganize[];
}

export interface PeaOrganize {
  id: string;
  level: string;
  name: string;
  regiongroup: string;
  children: SubPeaOrganize[];
}

export type ServiceRequest = {
  id: string;
  workOrderNo: string;
  requestNo: string;
  serviceId: string;
  requestCode: string;
  serviceType: string;
  createdDate: string;
  createdAt: string;
  customerName: string;
  statusCode: string;
  customerRequestNo: string;
  customerAddress: string;
  customerMobileNo: string;
  serviceGroupName: string;
  serviceName: string;
  status: string;
  statusDescription: string;
  workOrderParentId: string;
  costCenter: string;
  peaOffice: string;
  officePlant: string;
  peaNameFull: string;
  sapOrderNo: string;
  defaultActivityPmCode: string;
};

export type BusinessTypeObj = {
  id: string;
  name: string;
};

export type Event = {
  id: number;
  ktext: string;
  lstar: string;
};

export type MainWorkCenter = {
  Id: number;
  Ktext: string;
  Arbpl: string;
};

export interface ResponsiblePersonObj {
  id?: number | string;
  username: string;
  isUpdate: boolean;
  isEdited: boolean;
}

export interface RequestServiceDetail
  extends InverterData,
    SiteSurveyAirCondition {
  businessTypeId?: string;
  package_id?: string;
  transformer_voltage?: string;
  request_type?: string;
  service_type?: string;
  items: RequestServiceItem[] | Transformer[] | Insulator[];
  renewable_source_id: string;
  renewable_type_id: string;
  source_other: string;
  year: Date | undefined;
  num_years: string | number;
  start_date?: Date | undefined;
  end_date?: Date | undefined;
  days?: number;
  transformer?: TransFormerS315[];
}

type OptionApi = {
  id: string;
  option_title: string;
};

export interface TransFormerVoltage extends OptionApi {}
export interface RenewableSource extends OptionApi {}
export interface RenewableType extends OptionApi {}
export interface ServiceEquipment extends OptionApi {}
export interface TransformerOptions extends OptionApi {}

export interface WorkerOptionObj {
  username: string;
  firstName: string;
  lastName: string;
}

export interface VendorWorkcenter {
  workcenterCode: string;
  workcenterName: string;
}

export interface VendorOptionObj {
  username: string;
  employeeName: string | null;
  employeeId: string | null;
  workcenters: VendorWorkcenter[];
}

export interface TransFormerS315 {
  id?: string | number;
  transformer_size: string;
  transformer_qty: number;
  isUpdate?: boolean;
  isEdited?: boolean;
}

export interface InverterData {
  distanceSolarToInverter: number;
  distanceInverterToPanel: number;
  connectionType: "LAN" | "WiFi" | "other";
  otherConnectionDetail: string;
}

export interface SiteSurveyAirCondition {
  refrigerantPipeDistance: number;
  dcCableDistance: number;
  acCableDistance: number;
  houseFrontDirection: string;
}

export interface WorkOrderCreateItem {
  serviceId: string;
  workOrderType: "single" | "bulk";
  requestCode?: string;
  customerRequestNo?: string | null;
  workOrderParentId?: string;
  sapOrderNo?: string;
  serviceTypes?: string[];
  serviceSpecificData?: ServiceSpecificData;
  selectedPeaOffices?: string[];
}

export interface BulkWorkOrderCreateItem {
  bulkType: string;
  customerRequestNo?: string;
  existingParentWorkOrderId?: string;
  mainWorkOrder?: {
    serviceId: string;
  };
  selectedPeaOffices: string[];
}

export type ResolvedData = {
  respEventOptions?: Options[];
  resMainWorkCenter?: Options[];
  resWorkerOptions?: Options[];
  resParticipantOptions?: Options[];
  resServiceEquipmentOptions?: Options[];
  resBusinessType?: Options[];
  resVoltages?: Options[];
  resRenewableSource?: Options[];
  resRenewableType?: Options[];
  resTransformerBrands?: Options[];
  resTransformerPhase?: Options[];
  resTransformerType?: Options[];
  resTransformerSize?: Options[];
  resReqService?: Options[];
  resServiceTypes?: Options[];
  resMeterEquipmentOptions?: Options[];
  resActivityPMOptions?: Options[];
};

export interface ElectricGeneratorObj {
  repeat_start_date: Date | undefined;
  repeat_end_date: Date | undefined;
  repeat_start_time: Date | undefined;
  repeat_end_time: Date | undefined;
  repeat_minutes: number;
}

export interface StepWorkOrderObj {
  name: string;
  icon: IconDefinition;
}

// สำหรับ S302, S303, S304, S306, S309, S310, S311, S317, S319, S320, S323, S399
export interface BusinessTypeOnlyData {
  businessTypeId: string;
}

export type ServiceSpecificData =
  | BusinessTypeOnlyData
  | S301ServiceData
  | S305ServiceData
  | S307ServiceData
  | S308ServiceData
  | S312ServiceData
  | S314ServiceData
  | S315ServiceData
  | S316ServiceData
  | S318ServiceData
  | S322ServiceData
  | S329ServiceData
  | S332SolarAirData
  | S332SolarBatteryData;

// S301: ขอซ่อมแซมอุปกรณ์ไฟฟ้า
export interface S301ServiceData {
  equipments: Array<S301EquipmentServiceData>;
}

export interface S301EquipmentServiceData {
  equipmentTypeId: string;
  amount: number;
  isUpdate: boolean;
  isEdited: boolean;
}

// S305: ขอบำรุงรักษาหม้อแปลงไฟฟ้า
export interface S305ServiceData {
  requestServiceTypeId: string;
  requestServiceId: string;
  transformers: Array<S305TransformerServiceData>;
}

export interface S305TransformerServiceData {
  transformerBrandId: string;
  transformerPhaseId: string;
  transformerTypeId: string;
  transformerSerial?: string;
  transformerSize?: string;
  transformerVoltage?: string;
  isUpdate: boolean;
  isEdited: boolean;
}

// S307: ขอแก้ไขและบำรุงรักษาระบบจำหน่ายโดย Hotline
export interface S307ServiceData {
  businessTypeId: string;
  voltageId: string;
}

// S308: ขอตรวจสอบระบบไฟฟ้าพร้อมออกใบรับรอง
export interface S308ServiceData {
  businessTypeId: string;
  transformerCapacityKw: number;
  transformers: Array<{
    transformerBrandId: string;
    transformerPhaseId: string;
    transformerTypeId: string;
    transformerSerial: string;
    transformerSize: string;
    transformerVoltage: string;
  }>;
}

// S312: ขอทดสอบอุปกรณ์ไฟฟ้า
export interface S312ServiceData {
  businessTypeId: string;
  voltageId: string;
  equipments: Array<S301EquipmentServiceData>;
}

// S314: ขอเช่าฉนวนครอบสายไฟฟ้า
export interface S314ServiceData {
  rentalStartDate: string | Date | undefined;
  rentalEndDate: string | Date | undefined;
  rentalDays: number;
  cableInsulators: Array<S314CableServiceData>;
}

export interface S314CableServiceData {
  cableInsulator: string;
  amount: number;
  isUpdate: boolean;
  isEdited: boolean;
}

// S315: ขอเช่าหม้อแปลง
export interface S315ServiceData {
  businessTypeId: string;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  transformers: Array<S315TransformerServiceData>;
}

export interface S315TransformerServiceData {
  transformerCapacity: string;
  amount: number;
  isUpdate: boolean;
  isEdited: boolean;
}

// S316: ขอเช่าเครื่องกำเนิดไฟฟ้า
export interface S316ServiceData {
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  generatorStartDate: string | Date | undefined;
  generatorEndDate: string | Date | undefined;
  generatorStartTime: string;
  generatorEndTime: string;
  generators: Array<S316GeneratorServiceData>;
}

export interface S316GeneratorServiceData {
  transformerCapacityId: string;
  peaOfficeId: string;
  amount: number;
}

export interface S316GeneratorElectric {
  kwSize: string;
  peaName: string;
  telNumber: string;
  distanceKm: number;
}

// S318: ขอซื้อมิเตอร์/อุปกรณ์ไฟฟ้า
export interface S318ServiceData {
  equipments: Array<S318EquipmentServiceData>;
}

export interface S318EquipmentServiceData {
  equipmentId: string;
  capacity: string;
  amount: number;
  isUpdate: boolean;
  isEdited: boolean;
  price: string | number;
}

// S322: ขอตรวจสอบและบำรุงรักษาระบบไฟฟ้า แบบครบวงจร (Package)
export interface S322ServiceData {
  businessTypeId: string;
  packageId: string;
  packageTitle: string;
}

// S329: ขอซื้อขายใบรับรองการผลิตพลังงานหมุนเวียน
export interface S329ServiceData {
  businessTypeId: string;
  renewableType: string;
  renewableSource: string;
  year: string | Date | undefined;
  qty: number;
}

// S332 Solar Air
export interface S332SolarAirData {
  pipeLengthRefrigerantM?: number;
  cableLengthDcM?: number;
  cableLengthAcM?: number;
  houseFacingDirection?: string;
  frontHouseMediaId?: number;
  roofInstallationMediaId?: number;
  outdoorUnitLocationMediaId?: number;
  indoorUnitLocationMediaId?: number;
  acWiringPathMediaId?: number;
  dcWiringPathMediaId?: number;

  // ฟิลด์ที่ backend ส่งกลับ (เมื่อ GET เท่านั้น)
  //execution
  frontHouse?: UploaddedImage;
  acModel?: UploaddedImage;
  solarPanelModel?: UploaddedImage;
  mountingStructure?: UploaddedImage;
  solarPanelInstallation?: UploaddedImage;
  indoorOutdoorUnits?: UploaddedImage;
  pipingAndDrain?: UploaddedImage;
  acBreakerWiring?: UploaddedImage;
  dcBreakerWiring?: UploaddedImage;
  warrantyDoc?: UploaddedImage;
  groundingSystem?: UploaddedImage;

  //survey
  roofInstallationUrl?: string;
  outdoorUnitLocationUrl?: string;
  indoorUnitLocationUrl?: string;
  acWiringPathUrl?: string;
  dcWiringPathUrl?: string;
}

// S332 Solar Battery
export interface S332SolarBatteryData {
  networkConnectionTypeId?: string;
  distancePanelToInverterM?: number;
  distanceInverterToDistributionM?: number;
  networkConnectionTypeOther?: string;
  frontHouseMediaId?: number;
  electricityBillMediaId?: number;
  consumerUnitMediaId?: number;
  roofMediaId?: number;
  inverterLocationMediaId?: number;
  batteryLocationMediaId?: number;

  // Execution image media IDs
  inverterSerialMediaId?: number;
  solarPanelSerialMediaId?: number;
  inverterInstallationMediaId?: number;
  combinerBoxMediaId?: number;
  mdbInsideMediaId?: number;
  fuseDcMediaId?: number;
  surgeDcMediaId?: number;
  cableAcSizeMediaId?: number;
  cableDcSizeMediaId?: number;
  cableGroundSizeMediaId?: number;
  ctInstallationMediaId?: number;
  wiringPathAcdcMediaId?: number;
  mountingStructureMediaId?: number;
  solarPanelTopViewMediaId?: number;
  groundingSystemMediaId?: number;
  installationPlanPdfMediaId?: number;

  // ฟิลด์ที่ backend ส่งกลับ (เมื่อ GET เท่านั้น)
  frontHouseUrl?: string;
  frontHouse?: UploaddedImage;
  electricityBillUrl?: string;
  consumerUnitUrl?: string;
  roofUrl?: string;
  inverterLocationUrl?: string;
  batteryLocationUrl?: string;

  // Execution image URLs
  inverterSerial?: UploaddedImage;
  solarPanelSerial?: UploaddedImage;
  inverterInstallation?: UploaddedImage;
  combinerBox?: UploaddedImage;
  mdbInside?: UploaddedImage;
  fuseDc?: UploaddedImage;
  surgeDc?: UploaddedImage;
  cableAcSize?: UploaddedImage;
  cableDcSize?: UploaddedImage;
  cableGroundSize?: UploaddedImage;
  ctInstallation?: UploaddedImage;
  wiringPathAcdc?: UploaddedImage;
  mountingStructure?: UploaddedImage;
  solarPanelTopView?: UploaddedImage;
  batteryLocation?: UploaddedImage;
  groundingSystem?: UploaddedImage;
  installationPlanPdf?: UploaddedImage;
}

// สำหรับ MinIO file upload response
export interface MinIOUploadResponse {
  id: number;
  uuid: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileExtension: string;
  mediaType: string;
  md5Hash: string;
  bucketName: string;
  createdBy: string | null;
  createdAt: string;
}

// สำหรับ file upload ใน form
export interface FileUploadField {
  file: File;
  fieldName: string;
  folder: string;
}

interface UploaddedImage {
  id: number | string;
  file_id: string;
  name: string;
  fileName: string;
  originalName: string;
  size: number;
  fileSize: number;
  url: string;
  file: File;
  uploadDate?: Date;
  isUploading?: boolean;
  isOffline?: boolean;
}

interface UploadedFile {
  id: number | string;
  name: string;
  fileName?: string;
  originalName?: string;
  size: number;
  fileSize?: number;
  url: string;
  file: File;
  uploadDate?: Date;
  isUploading?: boolean;
  isOffline?: boolean;
  updatedAt?: string
}

interface SatisfactionData {
  id: number;
  completedAt: string;
  workOrderNumber: string;
  serviceRequestNumber: string;
  serviceType: string;
  serviceTypeName: string;
  overallRating: number;
  serviceRequest: {
    status: string;
    channel: string;
    receivedDate: string;
    requestNumber: string;
    sapRequestNumber: string;
    serviceType: string;
    serviceTypeName: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
    bp: string;
    ca: string;
    address: string;
    latitude: number;
    longitude: number;
    signatureUrl: string;
  };
  workers: Array<{
    employeeId: string;
    name: string;
    group: string;
    activity: string;
    mainWorkCenter: string;
    hoursPerWork: number;
  }>;
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
  };
  satisfaction: {
    overallRating: number;
    comment: string;
    evaluatedAt: string;
  };
  workOrder: {
    workOrderId: string;
    workOrderNumber: string;
    completedAt: string;
  };
}

interface WorkOrderHistory {
  id: string;
  uuid: string;
  systemType: string;
  logType: string;
  detail: string;
  ipAddress: string;
  userName: string;
  userFirstName: string;
  userLastName: string;
  userProfileImageUrl: string | null;
  hasDetail: boolean;
  createdAt: string;
  cancelNote?: string;
}

export interface CustomerRequest {
  customerName: string;
  customerMobileNo: string;
  customerAddress: string;
  customerEmail: string;
  customerBp: string;
  customerCa: string;
  customerLatitude: number;
  customerLongitude: number;
  serviceGroupName: string;
  serviceName: string;
  sapOrderNo: string;
  sapProcessCreatedDate: Date | string | undefined;
}

export type CalendarEvent = {
  title: string;
  start: Date | string;
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
  appointmentDate: string | Date;
  customerAddress?: string;
  customerName?: string;
  customerMobileNo?: string;
  workOrderNo?: string;
  customerRequestNo?: string;
  workTypeName?: string;
  workOrderId?: string;
  requestCode?: string;
  status?: string;
};

interface ParsedAddress {
  streetNumber: string;
  route: string;
  sublocality: string; // ตำบล
  district: string;
  province: string;
  postalCode: string;
  country: string;
  formattedAddress: string; // ที่อยู่แบบเต็ม
}

interface Survey {
  serviceId: string;
  workOrderNo: string;
  workOrderStatusCode: string;
  customerRequestNo: string;
  sapOrderNo: string;
  serviceName: string;
  requestCode: string;
  requestChannel: string;
  sapProcessCreatedDate?: string;
  customerMobileNo: number;
  customerLatitude: number;
  customerLongitude: number;
  customerAddress: string;
  customerName: string;
  requestData: {
    morning_flag: boolean,
    afternoon_flag: boolean
    detail: string
  },
  surveyData: WorkOrderSurveyData,
  note: string,
  images: number[],

  routeCode: string
  customerNumber: string
  meterSerialNumber: string
  recommendedPhase: string
  mainWorkCenterId: string
}

// S332 Solar Air Survey Data
export interface S332SolarAirSurveyData {
  house_facing_direction: string;
  refrigerant_pipe_length_m: number;
  dc_cable_length_m: number;
  ac_cable_length_m: number;
  house_front_media_id: number;
  houseFrontMedia: UploadedFile;
  roof_installation_media_id: number;
  roofInstallationMedia: UploadedFile;
  outdoor_unit_location_media_id: number;
  outdoorUnitLocationMedia: UploadedFile;
  indoor_unit_location_media_id: number;
  indoorUnitLocationMedia: UploadedFile;
  ac_cabling_route_media_id: number;
  acCablingRouteMedia: UploadedFile;
  dc_cabling_route_media_id: number;
  dcCablingRouteMedia: UploadedFile;
  cutout_breaker_media_id: number;
}

// S332 Solar Battery Survey Data
export interface S332SolarBatterySurveyData {
  pv_to_inverter_dist_m?: number;
  inverter_to_mdb_dist_m?: number;
  internet_conn_type?: string;
  internet_conn_remark?: string;
  houseFrontMedia: UploadedFile;
  meterBillMedia: UploadedFile;
  consumerUnitMedia: UploadedFile;
  roofAreaMedia: UploadedFile;
  inverterLocationMedia: UploadedFile;
  batteryLocationMedia: UploadedFile;
}

export interface BusinessTypeSurveyData {
  business_type_id: string;
}

// S316 Survey Data: ขอเช่าเครื่องกำเนิดไฟฟ้า
export interface S316SurveyData {
  kw_size_reservation: Array<{
    id: number;
    pea_name: string;
    distance: number;
    tel_number: string;
  }>;
  requests_serviceS316: {
    rental_startdate: string | Date | undefined;
    rental_enddate: string | Date | undefined;
    start_time: string;
    end_time: string;
  };
}

export interface WorkOrderSurveyData {
  status: string;
  note: string;
  result_note: string;
  survey_by: string;
  appointment_date: string | Date |  undefined;
  images: UploaddedImage[];
  serviceSpecificData: BusinessTypeSurveyData
    | S316SurveyData
    | S332SolarAirSurveyData
    | S332SolarBatterySurveyData
}

interface SurveyHistoryObj {
  username: string;
  name: string;
  appointment_datetime: string;
  updated_date: string;
  status: string;
  detail: string;
  survey_by: string;
  surveyByName: string;
}

export interface WorkOrderDashBoardSummary {
  summary: {
    totalWorkOrders: number,
    execution: WorkOrderSummary,
    survey: WorkOrderSummary,
  },
  weeklyData: WorkOrderWeeklyData[]
}

export interface WorkOrderSummary {
  total: number;
  pending: number;
  complete: number;
}

export interface WorkOrderWeeklyData {
  date: string,
  dayOfWeek: number,
  dayOfWeekThai: string,
  executionWorkOrders: number,
  fieldSurveys: number
}

export interface CancelWorkOrderRequest {
  note: string
}

export interface ActivityPMOptionObj {
  id: number
  ilart: string
  ilatx: string
}

export interface WeekRange {
  from: Date
  to: Date
}
