import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BaseModal from "./BaseModal";
import { WarnIcon } from "./icons/RutilVmIcons";

/*안씀 쓰는곳거의없음 */
/**
 * @name DeleteModal
 * @description ...
 *
 * @param {boolean} isOpen
 * @returns
 */
const DeleteModal = ({ isOpen, onClose, label, data, api, navigation }) => {
  const navigate = useNavigate();
  const { mutate: deleteApi } = api;

  const { ids, names } = useMemo(() => {
    if (!data) return { ids: [], names: [] };

    const dataArray = Array.isArray(data) ? data : [data];
    return {
      ids: dataArray.map((item) => item.id),
      names: dataArray.map((item) => item.name),
    };
  }, [data]);

  const handleDelete = () => {
    if (!ids.length) return console.error(`삭제할 ${label} ID가 없습니다.`);

    ids.forEach((id, index) => {
      deleteApi(id, {
        onSuccess: () => {
          if (ids.length === 1 || index === ids.length - 1) {
            onClose();
            toast.success(`${label} 삭제 완료`);
            navigate(navigation);
          }
        },
        onError: (error) => {
          toast.success(`${label} 삭제 완료 ${error.message}`);
        },
      });
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}
      targetName={label}
      submitTitle={"삭제"}
      onSubmit={handleDelete}
    >
      {/* <div className="storage-delete-popup modal"> */}
      <div className="disk-delete-box">
        <div>
          <WarnIcon />
          <span> {names.join(", ")} 를(을) 삭제하시겠습니까? </span>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteModal;
