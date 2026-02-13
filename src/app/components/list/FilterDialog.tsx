import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilter} from "@fortawesome/free-solid-svg-icons";

const FilterDialog = ({children}: { children: React.ReactNode, }) => {
  return (
    <Dialog>
      <DialogTrigger className="px-4 py-3 rounded-full bg-[#E1D2FF] cursor-pointer">
        <FontAwesomeIcon icon={faFilter} size="lg" color="#671FAB"/>
      </DialogTrigger>

      {children}
    </Dialog>
  )
}

export default FilterDialog;
