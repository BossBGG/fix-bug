import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {cn} from "@/lib/utils";

const ButtonSearch = ({
                        className,
                        visibleIconSearch = false,
                        onClickSearch
                      }: {
  className?: React.ReactNode,
  visibleIconSearch?: boolean,
  onClickSearch: () => void,
}) => {
  return (
    <button
      className={cn(className, "pea-button text-nowrap w-full mt-3 lg:mt-0")}
      onClick={() => onClickSearch()}
    >
      {
        visibleIconSearch && <FontAwesomeIcon icon={faSearch} size="lg" className="mr-2"/>
      }
      ค้นหา
    </button>
  )
}

export default ButtonSearch;
