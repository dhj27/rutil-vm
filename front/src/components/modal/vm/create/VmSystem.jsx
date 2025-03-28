import { useState } from "react";
import LabelInputNum from "../../../label/LabelInputNum";
import LabelSelectOptions from "../../../label/LabelSelectOptions";
import { RVI16, rvi16ArrowsDown, rvi16Check, rvi16ChevronDown, rvi16ChevronUp, rvi16SeverityErrorLined } from "../../../icons/RutilVmIcons";


const VmSystem = ({ editMode, formSystemState, setFormSystemState}) => {
  // 총 cpu 계산
  const calculateFactors = (num) => {
    const factors = [];
    for (let i = 1; i <= num; i++) {
      if (num % i === 0) factors.push(i);
    }
    return factors;
  };

  // const handleCpuChange = (e) => {
  //   const totalCpu = parseInt(e.target.value, 10);
  //   if (!isNaN(totalCpu)) {
  //     setFormSystemState((prev) => ({
  //       ...prev,
  //       cpuTopologyCnt: totalCpu,
  //       cpuTopologySocket: totalCpu, // 기본적으로 소켓을 총 CPU로 설정
  //       cpuTopologyCore: 1,
  //       cpuTopologyThread: 1,
  //     }));
  //   }
  // };
  const handleCpuChange = (newCpuValueOrEvent) => {
    const totalCpu = typeof newCpuValueOrEvent === 'number'
      ? newCpuValueOrEvent
      : parseInt(newCpuValueOrEvent.target.value, 10);
  
    if (!isNaN(totalCpu) && totalCpu > 0) {
      setFormSystemState((prev) => ({
        ...prev,
        cpuTopologyCnt: totalCpu,
        cpuTopologySocket: totalCpu,
        cpuTopologyCore: 1,
        cpuTopologyThread: 1,
      }));
    }
  };
  

  const handleSocketChange = (e) => {
    const socket = parseInt(e.target.value, 10);
    const remaining = formSystemState.cpuTopologyCnt / socket;

    setFormSystemState((prev) => ({
      ...prev,
      cpuTopologySocket: socket,
      cpuTopologyCore: remaining, // 나머지 값은 코어로 설정
      cpuTopologyThread: 1, // 스레드는 기본적으로 1
    }));
  };

  const handleCoreChange = (e) => {
    const core = parseInt(e.target.value, 10);
    const remaining =
      formSystemState.cpuTopologyCnt /
      (formSystemState.cpuTopologySocket * core);

    setFormSystemState((prev) => ({
      ...prev,
      cpuTopologyCore: core,
      cpuTopologyThread: remaining, // 나머지 값은 스레드로 설정
    }));
  };

  const handleInputChange = (field) => (e) => {
    setFormSystemState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // 토글 상태
  const [showCpuDetail, setShowCpuDetail] = useState(false); 
  const toggleCpuDetail = () => setShowCpuDetail(prev => !prev);
  return (
    <>
      <div className="edit-second-content">
        <LabelInputNum label="메모리 크기(MB)" id="memory_size" value={formSystemState.memorySize} onChange={ handleInputChange("memorySize") }/>
        <LabelInputNum label="최대 메모리(MB)" id="max_memory" value={formSystemState.memoryMax} onChange={ handleInputChange("memoryMax") }/>
        <LabelInputNum label="할당할 실제 메모리(MB)" id="actual_memory" value={formSystemState.memoryActual} onChange={ handleInputChange("memoryActual") }/>
        
        {/* <LabelInputNum label="총 가상 CPU" id="total_cpu" 
          value={formSystemState.cpuTopologyCnt} 
          onChange={ handleCpuChange } 
        /> */}
        {/* <LabelInputNum
          label="총 가상 CPU"
          id="total_cpu"
          value={formSystemState.cpuTopologyCnt}
          onChange={handleCpuChange}
        /> */}
        <label>총 가상 CPU</label>
        <input
          type="number"
          id="total_cpu"
          value={formSystemState.cpuTopologyCnt}
          onChange={handleCpuChange}
          min={1}
        />

        <button className="btn-toggle-cpu" onClick={toggleCpuDetail}>
          <RVI16 iconDef={showCpuDetail ? rvi16ChevronUp : rvi16ChevronDown} className="mr-1.5" />
          {showCpuDetail ? "CPU 상세 옵션 닫기" : "CPU 상세 옵션 열기(체크박스형식?)"}
        </button>
        
        {showCpuDetail && (
          <div>
            <LabelSelectOptions
              label="가상 소켓"
              id="virtual_socket"
              value={formSystemState.cpuTopologySocket}
              onChange={handleSocketChange}
              options={calculateFactors(formSystemState.cpuTopologyCnt).map((v) => ({
                value: v, label: v,
              }))}
            />
            <LabelSelectOptions
              label="가상 소켓 당 코어"
              id="core_per_socket"
              value={formSystemState.cpuTopologyCore}
              onChange={handleCoreChange}
              options={calculateFactors(
                formSystemState.cpuTopologyCnt / formSystemState.cpuTopologySocket
              ).map((v) => ({
                value: v, label: v,
              }))}
            />
            <LabelSelectOptions
              label="코어당 스레드"
              id="thread_per_core"
              value={formSystemState.cpuTopologyThread}
              onChange={(e) =>
                setFormSystemState((prev) => ({
                  ...prev,
                  cpuTopologyThread: parseInt(e.target.value, 10),
                }))
              }
              options={calculateFactors(
                formSystemState.cpuTopologyCnt /
                  (formSystemState.cpuTopologySocket * formSystemState.cpuTopologyCore)
              ).map((v) => ({
                value: v, label: v,
              }))}
            />
          </div>
        )}


      </div>
        {/* 삭제예정 */}
        {/* <div className="network_form_group">
          <label htmlFor="virtual_socket">가상 소켓</label>
          <select
            id="virtual_socket"
            value={formSystemState.cpuTopologySocket}
            onChange={handleSocketChange}
          >
            {calculateFactors(formSystemState.cpuTopologyCnt).map((factor) => (
              <option key={factor} value={factor}>
                {factor}
              </option>
            ))}
          </select>
        </div>
        <div className="network_form_group">
          <label htmlFor="core_per_socket">가상 소켓 당 코어</label>
          <select
            id="core_per_socket"
            value={formSystemState.cpuTopologyCore}
            onChange={handleCoreChange}
          >
            {calculateFactors(formSystemState.cpuTopologyCnt / formSystemState.cpuTopologySocket).map((factor) => (
              <option key={factor} value={factor}>
                {factor}
              </option>
            ))}
          </select>
        </div>
        <div className="network_form_group">
          <label htmlFor="thread_per_core">코어당 스레드</label>
          <select
            id="thread_per_core"
            value={formSystemState.cpuTopologyThread}
            onChange={(e) =>
              setFormSystemState((prev) => ({
                ...prev,
                cpuTopologyThread: parseInt(e.target.value, 10),
              }))
            }
          >
            {calculateFactors(
              formSystemState.cpuTopologyCnt /(formSystemState.cpuTopologySocket * formSystemState.cpuTopologyCore)
            ).map((factor) => (
              <option key={factor} value={factor}>
                {factor}
              </option>
            ))}
          </select>
        </div> */}

    </>
  );
};

export default VmSystem;