import {faFile, faPen, faUser, faWrench} from "@fortawesome/free-solid-svg-icons";
import {StepWorkOrderObj} from "@/types";

export const stepsWorkOrder: StepWorkOrderObj[] = [
  { name: "ข้อมูลลูกค้า", icon: faPen },
  { name: "ผู้ปฏิบัติงาน", icon: faUser },
  { name: "อุปกรณ์ปฏิบัติงาน", icon: faWrench },

];

export const stepsExecution: StepWorkOrderObj[] = [
  { name: "ข้อมูลลูกค้า", icon: faPen },
  { name: "ผู้ปฏิบัติงาน", icon: faUser },
  { name: "อุปกรณ์ปฏิบัติงาน", icon: faWrench },
  { name: "ผลปฏิบัติงาน", icon: faFile },
];
