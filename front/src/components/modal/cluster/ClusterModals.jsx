import React from 'react';
import ClusterModal from "./ClusterModal";
import DeleteModal from "../../../utils/DeleteModal";
import { useDeleteCluster } from "../../../api/RQHook";

const ClusterModals = ({
  activeModal,
  cluster,
  selectedClusters = [],
  datacenterId,
  onClose,
}) => {
  const modals = {
    create: (
      <ClusterModal
        isOpen={activeModal === "create"}
        datacenterId={datacenterId}
        onClose={onClose}
      />
    ),
    edit: (
      <ClusterModal
        editMode
        isOpen={activeModal === "edit"}
        clusterId={cluster?.id}
        onClose={onClose}
      />
    ),
    delete: (
      <DeleteModal
        isOpen={activeModal === "delete"}
        label={"클러스터"}
        data={selectedClusters}
        onClose={onClose}
        api={useDeleteCluster()}
        // navigation={''}
      />
    ),
  };

  return (
    <>
      {Object.keys(modals).map((key) => (
        <React.Fragment key={key}>{modals[key]}</React.Fragment>
      ))}
    </>
  );
};

export default ClusterModals;
