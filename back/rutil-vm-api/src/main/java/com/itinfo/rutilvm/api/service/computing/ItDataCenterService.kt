package com.itinfo.rutilvm.api.service.computing

import com.itinfo.rutilvm.common.LoggerDelegate
import com.itinfo.rutilvm.api.error.toException
import com.itinfo.rutilvm.api.model.IdentifiedVo
import com.itinfo.rutilvm.api.model.computing.*
import com.itinfo.rutilvm.api.model.fromDisksToIdentifiedVos
import com.itinfo.rutilvm.api.model.fromTemplateToIdentifiedVo
import com.itinfo.rutilvm.api.model.network.NetworkVo
import com.itinfo.rutilvm.api.model.network.VnicProfileVo
import com.itinfo.rutilvm.api.model.network.toNetworkVos
import com.itinfo.rutilvm.api.model.network.toVnicProfileToVmVos
import com.itinfo.rutilvm.api.model.setting.PermissionVo
import com.itinfo.rutilvm.api.model.setting.toPermissionVos
import com.itinfo.rutilvm.api.model.storage.*
import com.itinfo.rutilvm.api.repository.engine.DiskVmElementRepository
import com.itinfo.rutilvm.api.repository.engine.entity.DiskVmElementEntity
import com.itinfo.rutilvm.api.repository.engine.entity.toVmId
import com.itinfo.rutilvm.api.repository.history.dto.UsageDto
import com.itinfo.rutilvm.api.service.BaseService
import com.itinfo.rutilvm.api.service.storage.DiskServiceImpl
import com.itinfo.rutilvm.api.service.storage.ItDiskService
import com.itinfo.rutilvm.api.service.storage.StorageServiceImpl
import com.itinfo.rutilvm.api.service.storage.StorageServiceImpl.Companion
import com.itinfo.rutilvm.util.ovirt.*
import com.itinfo.rutilvm.util.ovirt.error.ErrorPattern
import org.ovirt.engine.sdk4.types.*
import org.ovirt.engine.sdk4.Error
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*
import kotlin.jvm.Throws

interface ItDataCenterService {
	/**
	 * [ItDataCenterService.findAll]
	 * 데이터센터 전체 목록
	 *
	 * @return List<[DataCenterVo]> 데이터센터 목록
	 */
	@Throws(Error::class)
	fun findAll(): List<DataCenterVo>
	/**
	 * [ItDataCenterService.findOne]
	 * 데이터센터 정보 (편집창)
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return [DataCenterVo]?
	 */
	@Throws(Error::class)
	fun findOne(dataCenterId: String): DataCenterVo?
	/**
	 * [ItDataCenterService.add]
	 * 데이터센터 생성
	 *
	 * @param dataCenterVo [DataCenterVo]
	 * @return [DataCenterVo]?
	 */
	@Throws(Error::class)
	fun add(dataCenterVo: DataCenterVo): DataCenterVo?
	/**
	 * [ItDataCenterService.update]
	 * 데이터센터 편집
	 *
	 * @param dataCenterVo [DataCenterVo]
	 * @return [DataCenterVo]?
	 */
	@Throws(Error::class)
	fun update(dataCenterVo: DataCenterVo): DataCenterVo?
	/**
	 * [ItDataCenterService.remove]
	 * 데이터센터 삭제
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return [Boolean]
	 */
	@Throws(Error::class)
	fun remove(dataCenterId: String): Boolean

	/**
	 * [ItDataCenterService.findAllClustersFromDataCenter]
	 * 데이터센터가 가지고있는 클러스터 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[ClusterVo]> 클러스터 목록
	 */
	@Throws(Error::class)
	fun findAllClustersFromDataCenter(dataCenterId: String): List<ClusterVo>
	/**
	 * [ItDataCenterService.findAllHostsFromDataCenter]
	 * 데이터센터가 가지고있는 호스트 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[HostVo]> 호스트 목록
	 */
	@Throws(Error::class)
	fun findAllHostsFromDataCenter(dataCenterId: String): List<HostVo>
	/**
	 * [ItDataCenterService.findAllVmsFromDataCenter]
	 * 데이터센터가 가지고있는 가상머신 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[VmVo]> 가상머신 목록
	 */
	@Throws(Error::class)
	fun findAllVmsFromDataCenter(dataCenterId: String): List<VmViewVo>
	/**
	 * [ItDataCenterService.findAllStorageDomainsFromDataCenter]
	 * 데이터센터가 가지고있는 스토리지 도메인 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[StorageDomainVo]> 스토리지 도메인 목록
	 */
	@Throws(Error::class)
	fun findAllStorageDomainsFromDataCenter(dataCenterId: String): List<StorageDomainVo>
	/**
	 * [ItDataCenterService.findAllActiveStorageDomainsFromDataCenter]
	 * 데이터센터가 가지고있는 활성화 된 스토리지 도메인 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[StorageDomainVo]> 스토리지 도메인 목록
	 */
	@Throws(Error::class)
	fun findAllActiveStorageDomainsFromDataCenter(dataCenterId: String): List<StorageDomainVo>
	/**
	 * [ItDataCenterService.findAllDisksFromDataCenter]
	 * 데이터센터가 가지고있는 디스크 목록 (데이터센터에 속한 스토리지 도메인이 가지고 있는 디스크 목록)
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[DiskImageVo]> 디스크 목록
	 */
	@Throws(Error::class)
	fun findAllDisksFromDataCenter(dataCenterId: String): List<DiskImageVo>
	/**
	 * [ItDataCenterService.findAllNetworksFromDataCenter]
	 * 데이터센터가 가지고있는 네트워크 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[NetworkVo]> 네트워크 목록
	 */
	@Throws(Error::class)
	fun findAllNetworksFromDataCenter(dataCenterId: String): List<NetworkVo>
	/**
	 * [ItDataCenterService.findAllEventsFromDataCenter]
	 * 데이터센터가 가지고 있는 이벤트 목록
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[EventVo]> 이벤트 목록
	 */
	@Throws(Error::class)
	fun findAllEventsFromDataCenter(dataCenterId: String): List<EventVo>

	/**
	 * [ItDataCenterService.findTemplatesFromDataCenter]
	 * 가상머신 생성 - 템플릿
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[IdentifiedVo]> 디스크  목록
	 */
	@Throws(Error::class)
	fun findTemplatesFromDataCenter(dataCenterId: String): List<IdentifiedVo>
	/**
	 * [ItDataCenterService.findAttachDiskImageFromDataCenter]
	 * 가상머신 생성 - 인스턴스 이미지 - 연결 -> 디스크 목록
	 * 기준: 아무것도 연결되어 있지 않은 디스크
	 * 인스턴스 이미지 -> 생성 시 필요한 스토리지 도메인
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[DiskImageVo]> 디스크  목록
	 */
	@Throws(Error::class)
	fun findAttachDiskImageFromDataCenter(dataCenterId: String): List<DiskImageVo>
	/**
	 * [ItDataCenterService.findAllISOFromDataCenter]
	 * 가상머신 생성 - 부트 옵션 - 생성 시 필요한 CD/DVD 연결할 ISO 목록 (디스크이미지)
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[IdentifiedVo]> ISO 목록
	 */
	@Throws(Error::class)
	fun findAllISOFromDataCenter(dataCenterId: String): List<IdentifiedVo>
	/**
	 * [ItDataCenterService.findAllVnicProfilesFromDataCenter]
	 * 가상머신 생성 -  vnicprofile 목록 출력 (가상머신 생성, 네트워크 인터페이스 생성)
	 *
	 * @param dataCenterId [String] 데이터센터 Id
	 * @return List<[VnicProfileVo]> VnicProfile 목록
	 */
	@Throws(Error::class)
	fun findAllVnicProfilesFromDataCenter(dataCenterId: String): List<VnicProfileVo>

	/**
	 * [ItDataCenterService.dashboardComputing]
	 * 대시보드 컴퓨팅 목록
	 */
	@Throws(Error::class)
	fun dashboardComputing(): List<DataCenterVo>
	/**
	 * [ItDataCenterService.dashboardNetwork]
	 * 대시보드 네트워크
	 */
	@Throws(Error::class)
	fun dashboardNetwork(): List<DataCenterVo>
	/**
	 * [ItDataCenterService.dashboardStorage]
	 * 대시보드 - 스토리지
	 */
	@Throws(Error::class)
	fun dashboardStorage(): List<DataCenterVo>
}

@Service
class DataCenterServiceImpl(
): BaseService(), ItDataCenterService {
	@Autowired private lateinit var itGraphService: ItGraphService

	@Throws(Error::class)
	override fun findAll(): List<DataCenterVo> {
		log.info("findAll ... ")
		val res: List<DataCenter> = conn.findAllDataCenters(follow = "clusters").getOrDefault(emptyList())
		return res.toDataCentersMenu(conn)
	}

	@Throws(Error::class)
	override fun findOne(dataCenterId: String): DataCenterVo? {
		log.info("findOne ... dataCenterId: {}", dataCenterId)
		val res: DataCenter? = conn.findDataCenter(dataCenterId).getOrNull()
		return res?.toDataCenterVoInfo()
	}

	@Throws(Error::class)
	override fun add(dataCenterVo: DataCenterVo): DataCenterVo? {
		log.info("add ... name: {}", dataCenterVo.name)
		val res: DataCenter? = conn.addDataCenter(
			dataCenterVo.toAddDataCenterBuilder()
		).getOrNull()
		return res?.toDataCenterIdName()
	}

	@Throws(Error::class)
	override fun update(dataCenterVo: DataCenterVo): DataCenterVo? {
		log.info("update ... name: {}", dataCenterVo.name)
		val res: DataCenter? = conn.updateDataCenter(
			dataCenterVo.toEditDataCenterBuilder()
		).getOrNull()
		return res?.toDataCenterIdName()
	}

	@Throws(Error::class)
	override fun remove(dataCenterId: String): Boolean {
		log.info("remove ... dataCenterId: {}", dataCenterId)
		val res: Result<Boolean> = conn.removeDataCenter(dataCenterId)
		return res.isSuccess
	}


	@Throws(Error::class)
	override fun findAllClustersFromDataCenter(dataCenterId: String): List<ClusterVo> {
		log.info("findAllClustersFromDataCenter ... dataCenterId: {}", dataCenterId)
		val res: List<Cluster> = conn.findAllClustersFromDataCenter(dataCenterId).getOrDefault(emptyList())
		return res.toClustersMenu(conn)
	}

	@Throws(Error::class)
	override fun findAllHostsFromDataCenter(dataCenterId: String): List<HostVo> {
		log.debug("findAllHostsFromDataCenter ... dataCenterId: {}", dataCenterId)
		val res: List<Host> = conn.findAllHostsFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())

		return res.map { host ->
			val hostNic: HostNic? = conn.findAllHostNicsFromHost(host.id())
				.getOrDefault(emptyList()).firstOrNull()
			val usageDto = calculateUsage(host, hostNic)
			host.toHostMenu(conn, usageDto)
		}
	}

	private fun calculateUsage(host: Host, hostNic: HostNic?): UsageDto? {
		return if (host.status() == HostStatus.UP && hostNic != null) {
			itGraphService.hostPercent(host.id(), hostNic.id())
		} else null
	}

	@Throws(Error::class)
	override fun findAllVmsFromDataCenter(dataCenterId: String): List<VmViewVo> {
		log.debug("findAllVmsFromDataCenter ... dataCenterId: {}", dataCenterId)
		val res: List<Vm> = conn.findAllVmsFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())
		return res.toVmsMenu(conn)
	}

	@Throws(Error::class)
	override fun findAllStorageDomainsFromDataCenter(dataCenterId: String): List<StorageDomainVo> {
		log.info("findAllStorageDomainsFromDataCenter ... dataCenterId: {}", dataCenterId)
		val res: List<StorageDomain> = conn.findAllAttachedStorageDomainsFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())
		return res.toStorageDomainsMenu(conn)
	}

	@Throws(Error::class)
	override fun findAllActiveStorageDomainsFromDataCenter(dataCenterId: String): List<StorageDomainVo> {
		log.info("findAllFromDataCenter ... dcId: $dataCenterId")
		val res: List<StorageDomain> = conn.findAllAttachedStorageDomainsFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())
			.filter { it.status() == StorageDomainStatus.ACTIVE }
		return res.toActiveDomains()
	}

	@Throws(Error::class)
	override fun findAllDisksFromDataCenter(dataCenterId: String): List<DiskImageVo> {
		val res: List<Disk> = conn.findAllAttachedStorageDomainsFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())
			.flatMap { conn.findAllDisksFromStorageDomain(it.id()).getOrDefault(emptyList()) }
		return res.toDiskMenus(conn)
	}

	@Throws(Error::class)
	override fun findAllNetworksFromDataCenter(dataCenterId: String): List<NetworkVo> {
		log.info("findAllNetworksFromDataCenter ... dataCenterId: {}", dataCenterId)
		val res: List<Network> = conn.findAllNetworks()
			.getOrDefault(emptyList())
			.filter { it.dataCenter().id() == dataCenterId }
		return res.toNetworkVos(conn)
	}

	@Throws(Error::class)
	override fun findAllEventsFromDataCenter(dataCenterId: String): List<EventVo> {
		log.info("findAllEventsFromDataCenter ... dataCenterId: {}", dataCenterId)
		val dataCenter: DataCenter? = conn.findDataCenter(dataCenterId)
			.getOrNull()
		val res: List<Event> = conn.findAllEvents()
			.getOrDefault(emptyList())
			.filter {(it.dataCenterPresent() && (
					(it.dataCenter().idPresent() && it.dataCenter().id() == dataCenterId) ||
					(it.dataCenter().namePresent() && it.dataCenter().name() == dataCenter?.name())))}
		return res.toEventVos()
	}

	@Throws(Error::class)
	override fun findTemplatesFromDataCenter(dataCenterId: String): List<IdentifiedVo> {
		log.info("findTemplatesFromDataCenter ... dataCenterId: {}", dataCenterId)

		val clusters: List<Cluster> = conn.findAllClustersFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())
		val templates: List<Template> = conn.findAllTemplates()
			.getOrDefault(emptyList())

		val clusterIds = clusters.map { it.id() }.toSet()
		val filteredTemplates = templates.filter {
			it.id().equals("00000000-0000-0000-0000-000000000000") || it.cluster().id() in clusterIds
		}

		return filteredTemplates.map { it.fromTemplateToIdentifiedVo() }
	}

	@Throws(Error::class)
	override fun findAttachDiskImageFromDataCenter(dataCenterId: String): List<DiskImageVo> {
		log.info("findAttachDiskImageByDataCenter ... 데이터센터 ID: $dataCenterId")
		conn.findDataCenter(dataCenterId)
			.getOrNull() ?: throw ErrorPattern.DATACENTER_ID_NOT_FOUND.toException()

		val res: List<DiskImageVo> = conn.findAllAttachedStorageDomainsFromDataCenter(dataCenterId)
			.getOrDefault(emptyList())
			.flatMap {
				conn.findAllDisksFromStorageDomain(it.id())
					.getOrDefault(emptyList())
					.filter { disk ->  disk.format() == DiskFormat.COW }
					// .filter { disk ->  disk.format() == DiskFormat.COW && disk.quotaPresent() }
					.map { disk ->  disk.toDiskInfo(conn) }
					.filter { disk ->  disk.connectVm.id == "" && disk.connectTemplate.id == "" }
			}
		return res
	}

	@Throws(Error::class)
	override fun findAllISOFromDataCenter(dataCenterId: String): List<IdentifiedVo> {
		log.info("findAllISOFromDataCenter ... ")
		val res: List<Disk> = conn.findDataCenter(dataCenterId, follow = "storagedomains.disks")
			.getOrNull()!!
			.storageDomains()
			.flatMap { it.disks().orEmpty() }
			.map { it }
			.filter { it.contentType() == DiskContentType.ISO && it.status() == DiskStatus.OK }
		return res.fromDisksToIdentifiedVos()
	}

	@Throws(Error::class)
	override fun findAllVnicProfilesFromDataCenter(dataCenterId: String): List<VnicProfileVo> {
		log.info("findAllVnicProfilesFromDataCenter ... dataCenterId: {}", dataCenterId)
		val res: List<VnicProfile> = conn.findAllNetworks()
			.getOrDefault(emptyList())
			.filter { it.dataCenter().id() == dataCenterId }
			.flatMap { network -> conn.findAllVnicProfilesFromNetwork(network.id())
				.getOrDefault(emptyList())
			}
		return res.toVnicProfileToVmVos(conn)
	}

	@Throws(Error::class)
	override fun dashboardComputing(): List<DataCenterVo> {
		log.info("dashboardComputing ... ")
		val res: List<DataCenter> = conn.findAllDataCenters().getOrDefault(emptyList())
		return res.toDataCenterVos(conn, findNetworks = false, findStorageDomains = false, findClusters = true)
	}

	@Throws(Error::class)
	override fun dashboardNetwork(): List<DataCenterVo> {
		log.info("dashboardNetwork ... ")
		val res: List<DataCenter> = conn.findAllDataCenters().getOrDefault(emptyList())
		return res.toDataCenterVos(conn, findNetworks = true, findStorageDomains = false, findClusters = false)
	}

	@Throws(Error::class)
	override fun dashboardStorage(): List<DataCenterVo> {
		log.info("dashboardStorage ... ")
		val res: List<DataCenter> = conn.findAllDataCenters().getOrDefault(emptyList())
		return res.toDataCenterVos(conn, findNetworks = false, findStorageDomains = true, findClusters = false)
	}


	companion object {
		private val log by LoggerDelegate()
	}
}
