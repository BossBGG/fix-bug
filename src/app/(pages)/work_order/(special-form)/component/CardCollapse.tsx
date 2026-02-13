import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useAppSelector} from "@/app/redux/hook";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import {RequiredLabel} from "@/app/helpers/RequiredFieldHelper";

const CardCollapse = ({
                        children,
                        title,
                        isShowHeader=true,
                        isRequired=false,
                        cardCollapseAddons
                      }: {
  children: React.ReactNode,
  title: string | React.ReactNode,
  isShowHeader?: boolean,
  isRequired?: boolean,
  cardCollapseAddons?: React.ReactNode
}) => {
  const [expanded, setExpanded] = useState<boolean>(true)
  const screenSize = useAppSelector(state => state.screen_size)

  useEffect(() => {
    if(!isShowHeader && screenSize === DESKTOP_SCREEN) {
      setExpanded(true)
    }
  }, [screenSize]);

  return (
    <Card className="mb-4" style={{boxShadow: '0px 4px 4px 0px #A6AFC366'}}>
      {
        isShowHeader &&
        <CardHeader className="bg-[#F4EEFF]">
          <CardTitle>
            <RequiredLabel required={isRequired}>{title}</RequiredLabel>
          </CardTitle>
          <CardAction className="cursor-pointer flex flex-end items-center">

            {cardCollapseAddons && cardCollapseAddons}

            {
              expanded
                ? <FontAwesomeIcon icon={faChevronUp} onClick={() => setExpanded(false)}/>
                : <FontAwesomeIcon icon={faChevronDown} onClick={() => setExpanded(true)}/>
            }
          </CardAction>
        </CardHeader>
      }

      {
        expanded &&  <CardContent className="p-3 relative">{children}</CardContent>
      }
    </Card>
  )
}

export default CardCollapse;
