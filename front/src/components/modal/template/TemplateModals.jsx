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
  const { activeModal, closeModal, } = useUIState()
  const { templatesSelected } = useGlobal()

  const modals = {
    update: (
      <TemplateEditModal isOpen={activeModal().includes("template:update")}
        onClose={() => closeModal("template:update")}
        editMode
        templateId={template?.id}
      />
    ), remove: (
      <DeleteModal isOpen={activeModal().includes("template:remove")}
        onClose={() => closeModal("template:remove")}
        label={Localization.kr.TEMPLATE}
        data={templatesSelected}
        api={useDeleteTemplate()}
        // navigation={''}
      />
    ), addVm: (
      <VmModal isOpen={activeModal().includes("vm:create")}
        onClose={() => closeModal("vm:create")}
        templateId={template?.id}
      />
    ),
  };
  
  return (
    <>
      {Object.keys(modals).filter((key) => 
        activeModal().includes(`vm:${key}`) || activeModal().includes(`template:${key}`)
      ).map((key) => (
        <React.Fragment key={key}>{modals[key]}</React.Fragment>
      ))}
    </>
  );
};

export default TemplateModals;
