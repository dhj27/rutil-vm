import React from "react";
import useUIState from "../../../hooks/useUIState";
import useGlobal from "../../../hooks/useGlobal";
import TemplateEditModal from "./TemplateEditModal";
import VmModal from "../../modal/vm/VmModal";
import DeleteModal from "../../../utils/DeleteModal";
import { useDeleteTemplate } from "../../../api/RQHook";
import Localization from "../../../utils/Localization";

const TemplateModals = ({
  template,
}) => {
  const { activeModal, setActiveModal, } = useUIState()
  const { templatesSelected } = useGlobal()

  const modals = {
    update: (
      <TemplateEditModal isOpen={activeModal() === "template:update"}
        onClose={() => setActiveModal(null)}  
        editMode
        templateId={template?.id}
      />
    ), remove: (
      <DeleteModal isOpen={activeModal() === "template:remove"}
        onClose={() => setActiveModal(null)}
        label={Localization.kr.TEMPLATE}
        data={templatesSelected}
        api={useDeleteTemplate()}
        // navigation={''}
      />
    ), addVm: (
      <VmModal isOpen={activeModal() === "vm:create"}
        onClose={() => setActiveModal(null)}
        templateId={template?.id}
      />
    ),
  };
  
  return (
    <>
      {Object.keys(modals).filter((key) => 
        activeModal() === `vm:${key}` || activeModal() === `template:${key}`
      ).map((key) => (
        <React.Fragment key={key}>{modals[key]}</React.Fragment>
      ))}
    </>
  );
};

export default TemplateModals;
