import Modal from "@/app/layout/Modal";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {Options, User} from "@/types";
import {getPeaOfficeList, updatePeaOffice} from "@/app/api/LoginApi";
import {showError, showProgress, showSuccess} from "@/app/helpers/Alert";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import InputSearchSelect from "@/app/components/form/InputSearchSelect";
import {setUserProfile} from "@/app/redux/slices/UserSlice";
import {setPeaOfficeOption} from "@/app/redux/slices/OptionSlice";
import {useRouter} from "next/navigation";

interface ModalPeaOrganizeProps {
  open: boolean;
  onClose: () => void;
}

const ModalPeaOrganize = ({
                            open,
                            onClose
                          }: ModalPeaOrganizeProps) => {
  const [value, setValue] = useState<string>('');
  const [peaOfficeOptions, setPeaOfficeOptions] = useState<Options[]>([]);
  let user: User = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter()

  useEffect(() => {
    fetchPeaOfficeOptions()
    if(user.selectedPeaOffice) {
      setValue(user.selectedPeaOffice);
    }
  }, []);

  useEffect(() => {
    setValue(user.selectedPeaOffice || '')
  }, [open]);

  const fetchPeaOfficeOptions = async (search: string = '') => {
    if (search.trim().length > 0 && search.trim().length < 3) {
      return;
    }
    setIsLoading(true)
    await getPeaOfficeList(search).then(async (res) => {
      if (res.data && res.status === 200) {
        const data = res.data.data || [];
        console.log('res.data >>>> ', res.data)
        if (data.length > 0) {
          const options: Options[] = []
          data.map((d) => {
            options.push({
              label: `${d.regiongroup} : ${d.peaNameFull} [${d.office}]`,
              value: d.office,
              data: d
            })
          })

          //get options โดย search จาก office ของ user กรณีที่ไม่มีใน limit options ที่ดึงมา
          if(user.selectedPeaOffice) {
            const hasSelectedOfficeOpt = options.find((option) => option.value === user.selectedPeaOffice)
            if (!hasSelectedOfficeOpt) {
              const res = await getPeaOfficeList(user.selectedPeaOffice)
              if(res.data && res.status === 200 && res.data.data && res.data.data.length > 0) {
                const itemSel = res.data.data[0];
                options.push({
                  value: itemSel.office,
                  label: `${itemSel.regiongroup} : ${itemSel.peaNameFull} [${itemSel.office}]`,
                  data: itemSel,
                })
              }
            }
          }

          setPeaOfficeOptions(options);
          dispatch(setPeaOfficeOption(options));
        }
      }
    }).finally(() => {
      setIsLoading(false);
    })
  }

  const onSubmit = async () => {
    showProgress()
    const item = {
      username: user.username,
      newPeaOffice: value
    }

    await updatePeaOffice(item).then(res => {
      if (res.data && res.data.status_code === 200) {
        user = {
          ...user,
          selectedPeaOffice: value
        }
        dispatch(setUserProfile(user))
        showSuccess('เปลี่ยนการไฟฟ้าสำเร็จ').then((res) => {
          onClose()
          router.push("/work_order")
        })
      }else {
        showError(res.data.message || '')
      }
    })
  }

  return (
    <Modal open={open} onClose={() => onClose()}
           title="เปลี่ยนการไฟฟ้า"
           footer={<FooterModal cancel={onClose} submit={() => onSubmit()}/>}
    >
      <InputSearchSelect selectOptions={peaOfficeOptions}
                         fetchOptions={fetchPeaOfficeOptions}
                         loading={isLoading}
                         onChange={(val: string) => setValue(val)}
                         value={value}
                         placeholder="เลือกการไฟฟ้า"
      />
    </Modal>
  )
}

const FooterModal = ({
                       cancel,
                       submit
                     }: { cancel: () => void; submit: () => void }) => (
  <div className="w-full flex flex-wrap justify-between items-center">
    <div className="p-2 w-1/2">
      <Button
        className="text-[#671FAB] w-full bg-white hover:bg-white border-1 border-[#671FAB] rounded-full font-semibold md:text-start text-center cursor-pointer"
        onClick={() => cancel()}
      >
        ยกเลิก
      </Button>
    </div>
    <div className="p-2 w-1/2">
      <Button className="pea-button w-full" onClick={() => submit()}>
        บันทึก
      </Button>
    </div>
  </div>
)

export default ModalPeaOrganize;
