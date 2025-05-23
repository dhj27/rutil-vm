package com.itinfo.rutilvm.api.service.computing

import com.itinfo.rutilvm.common.LoggerDelegate
import com.itinfo.rutilvm.api.error.toException
import com.itinfo.rutilvm.api.model.IdentifiedVo
import com.itinfo.rutilvm.api.model.computing.VmExportVo
import com.itinfo.rutilvm.api.model.computing.VmViewVo
import com.itinfo.rutilvm.api.model.fromHostsToIdentifiedVos
import com.itinfo.rutilvm.api.service.BaseService
import com.itinfo.rutilvm.util.ovirt.*
import com.itinfo.rutilvm.util.ovirt.error.ErrorPattern
import com.itinfo.rutilvm.util.ovirt.error.ItCloudException
import org.ovirt.engine.sdk4.Error
import org.ovirt.engine.sdk4.types.Cluster
import org.ovirt.engine.sdk4.types.Host
import org.ovirt.engine.sdk4.types.Vm

import org.springframework.stereotype.Service

interface ItVmOperationService {
	/**
	 * [ItVmOperationService.start]
	 * 가상머신 - 실행
	 *
	 * @param vmId [String] 가상머신 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun start(vmId: String): Boolean
	/**
	 * [ItVmOperationService.pause]
	 * 가상머신 - 일시정지
	 *
	 * @param vmId [String] 가상머신 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun pause(vmId: String): Boolean
	/**
	 * [ItVmOperationService.powerOff]
	 * 가상머신 - 전원끔
	 *
	 * @param vmId [String] 가상머신 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun powerOff(vmId: String): Boolean
	/**
	 * [ItVmOperationService.shutdown]
	 * 가상머신 - 종료
	 *
	 * @param vmId [String] 가상머신 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun shutdown(vmId: String): Boolean
	/**
	 * [ItVmOperationService.reboot]
	 * 가상머신 - 재부팅
	 *
	 * @param vmId [String] 가상머신 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun reboot(vmId: String): Boolean
	/**
	 * [ItVmOperationService.reset]
	 * 가상머신 - 재설정
	 *
	 * @param vmId [String] 가상머신 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun reset(vmId: String): Boolean

	/**
	 * [ItVmOperationService.findMigratableHosts]
	 * 마이그레이션 할 수 있는 호스트 목록
	 *
	 * @param vmIds List<[String]> 가상머신 Id 목록
	 * @return List<[IdentifiedVo]>
	 */
	@Throws(Error::class, ItCloudException::class)
	fun findMigratableHosts(vmIds: List<String>): List<IdentifiedVo>
	/**
	 * [ItVmOperationService.migrate]
	 * 가상머신 - 마이그레이션
	 *
	 * @param vmId [String] 가상머신 Id
	 * @param vmViewVo [VmViewVo] 마이그레이션할 클러스터 id /호스트 Id
	 * @param affinityClosure [Boolean]
	 * @return [Boolean]
	 */
	@Throws(Error::class, ItCloudException::class)
	fun migrate(vmId: String, vmViewVo: VmViewVo, affinityClosure: Boolean = false): Boolean

	// 가상머신 내보내기 창
	// 		호스트 목록 [ItClusterService.findAllHostsFromCluster] (가상 어플라이언스로 가상머신 내보내기)

	/**
	 * [ItVmOperationService.exportOva]
	 * 가상머신 ova로 내보내기 (실행시, 해당 host?vm? 내부에 파일이 생성됨)
	 *
	 * @param vmId [String]
	 * @param vmExportVo [VmExportVo]
	 * @return [Boolean]
	 */
	@Throws(Error::class)
	fun exportOva(vmId: String, vmExportVo: VmExportVo): Boolean
}

@Service
class VmOperationServiceImpl: BaseService(), ItVmOperationService {

	@Throws(Error::class, ItCloudException::class)
	override fun start(vmId: String): Boolean {
		log.info("start ... vmId: {}", vmId)
		val res: Result<Boolean> = conn.startVm(vmId)
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun pause(vmId: String): Boolean {
		log.info("pause ... vmId: {}", vmId)
		val res: Result<Boolean> = conn.suspendVm(vmId)
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun powerOff(vmId: String): Boolean {
		log.info("powerOff ... vmId: {}", vmId)
		val res: Result<Boolean> = conn.stopVm(vmId)
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun shutdown(vmId: String): Boolean {
		log.info("shutdown ... vmId: {}", vmId)
		val res: Result<Boolean> = conn.shutdownVm(vmId)
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun reboot(vmId: String): Boolean {
		log.info("reboot ... vmId: {}", vmId)
		val res: Result<Boolean> = conn.rebootVm(vmId)
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun reset(vmId: String): Boolean {
		log.info("reset ... vmId: {}", vmId)
		val res: Result<Boolean> = conn.resetVm(vmId)
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun findMigratableHosts(vmIds: List<String>): List<IdentifiedVo> {
		log.info("findMigratableHosts ... vmIds: {}", vmIds)
		val searchQuery: String = vmIds.joinToString(" or ") { "id=${it}" }
		val vms: List<Vm> = conn.findAllVms(searchQuery=searchQuery, follow="cluster")
			.getOrNull() ?: throw ErrorPattern.VM_NOT_FOUND.toException()
		val clusters: List<Cluster> = vms.mapNotNull {
			it.cluster()
		}.distinctBy {
			it.id()
		}
		if (clusters.isEmpty()) throw ErrorPattern.CLUSTER_NOT_FOUND.toException()
		val clusterIds: List<String> = clusters.map { it.id() }

		val res: List<Host> = conn.findAllHosts().getOrDefault(emptyList())
			.filter { clusterIds.indexOf(it.cluster().id()) > -1 }
			// 내 호스트랑 같은건 front 에서 처리
		return res.fromHostsToIdentifiedVos()
	}

	@Throws(Error::class, ItCloudException::class)
	override fun migrate(vmId: String, vmViewVo: VmViewVo, affinityClosure: Boolean): Boolean {
		log.info("migrate ... vmId:{}, vmViewVo: {}, aff: {}", vmId, vmViewVo, affinityClosure)
		val res: Result<Boolean> = when {
			vmViewVo.clusterVo.id != "" && vmViewVo.hostVo.id == "" -> conn.migrationVm(vmId, vmViewVo.clusterVo.id, affinityClosure)
			vmViewVo.clusterVo.id == "" && vmViewVo.hostVo.id != "" -> conn.migrationVmToHost(vmId, vmViewVo.hostVo.id, affinityClosure)
			else -> throw IllegalArgumentException("Cluster 또는 Host 정보가 필요합니다.")
		}
		return res.isSuccess
	}

	@Throws(Error::class, ItCloudException::class)
	override fun exportOva(vmId: String, vmExportVo: VmExportVo): Boolean {
		log.info("exportOva ... ")
		val res: Result<Boolean> = conn.exportVm(
			vmId,
			vmExportVo.hostVo.name,
			vmExportVo.directory,
			vmExportVo.fileName
		)
		return res.isSuccess
	}


	companion object {
		private val log by LoggerDelegate()
	}
}
