package com.itinfo.rutilvm.api.model.computing

import com.itinfo.rutilvm.common.gson
import com.itinfo.rutilvm.api.model.*
import com.itinfo.rutilvm.api.model.storage.*
import com.itinfo.rutilvm.util.ovirt.*
import org.ovirt.engine.sdk4.Connection
import org.ovirt.engine.sdk4.builders.DataCenterBuilder
import org.ovirt.engine.sdk4.builders.VersionBuilder
import org.ovirt.engine.sdk4.types.*
import org.slf4j.LoggerFactory
import java.io.Serializable

private val log = LoggerFactory.getLogger(DataCenterVo::class.java)

/**
 * [DataCenterVo]
 * 데이터센터
 *
 * @property id [String]
 * @property name [String]
 * @property comment [String] 코멘트
 * @property description [String] 설명
 * @property storageType [Boolean] 스토리지 유형(공유됨, 로컬)   api에 local로 표시됨
 * @property version [String] 상태(contend, maintenance, not_operational, problematic, uninitialized, up)
 * @property quotaMode [QuotaModeType] 쿼터모드(비활성화됨, 감사, 강제적용)
 * @property status [DataCenterStatus]
 * @property domainStatus [StorageDomainStatus] 스토리지 도메인 상태관리
 * @property clusterCnt [Int] 클러스터 개수
 * @property hostCnt [Int] 호스트 개수
 * @property clusterVos List<[clusterVos]>
 * @property networkVos List<[networkVos]>
 * @property storageDomainVos List<[storageDomainVos]>
 */
class DataCenterVo (
	val id: String = "",
	val name: String = "",
	val comment: String = "",
	val description: String = "",
	val storageType: Boolean = false,
	val version: String = "",
	val quotaMode: QuotaModeType = QuotaModeType.DISABLED,
	val status: DataCenterStatus = DataCenterStatus.NOT_OPERATIONAL,
	val domainStatus: StorageDomainStatus = StorageDomainStatus.UNKNOWN,
	val clusterCnt: Int = 0,
	val hostCnt: Int = 0,
	val clusterVos: List<IdentifiedVo> = listOf(),
	val networkVos: List<IdentifiedVo> = listOf(),
	val storageDomainVos: List<StorageDomainVo> = listOf(),
): Serializable {
	override fun toString(): String =
		gson.toJson(this)

	class Builder {
		private var bId: String = "";fun id(block: () -> String?) { bId = block() ?: "" }
		private var bName: String = "";fun name(block: () -> String?) { bName = block() ?: "" }
		private var bComment: String = "";fun comment(block: () -> String?) { bComment = block() ?: "" }
		private var bDescription: String = "";fun description(block: () -> String?) { bDescription = block() ?: "" }
		private var bStorageType: Boolean = false;fun storageType(block: () -> Boolean?) { bStorageType = block() ?: false }
		private var bVersion: String = "";fun version(block: () -> String?) { bVersion = block() ?: "" }
		private var bQuotaMode: QuotaModeType = QuotaModeType.DISABLED;fun quotaMode(block: () -> QuotaModeType?) { bQuotaMode = block() ?: QuotaModeType.DISABLED }
		private var bStatus: DataCenterStatus = DataCenterStatus.NOT_OPERATIONAL;fun status(block: () -> DataCenterStatus?) { bStatus = block() ?: DataCenterStatus.NOT_OPERATIONAL }
		private var bDomainStatus: StorageDomainStatus = StorageDomainStatus.UNKNOWN;fun domainStatus(block: () -> StorageDomainStatus?) { bDomainStatus = block() ?: StorageDomainStatus.UNKNOWN }
		private var bClusterCnt: Int = 0; fun clusterCnt(block: () -> Int?) { bClusterCnt = block() ?: 0 }
		private var bHostCnt: Int = 0; fun hostCnt(block: () -> Int?) { bHostCnt = block() ?: 0 }
		private var bClusterVos: List<IdentifiedVo> = listOf();fun clusterVos(block: () -> List<IdentifiedVo>?) { bClusterVos = block() ?: listOf() }
		private var bNetworkVos: List<IdentifiedVo> = listOf();fun networkVos(block: () -> List<IdentifiedVo>?) { bNetworkVos = block() ?: listOf() }
		private var bStorageDomainVos: List<StorageDomainVo> = listOf();fun storageDomainVos(block: () -> List<StorageDomainVo>?) { bStorageDomainVos = block() ?: listOf() }

		fun build(): DataCenterVo = DataCenterVo(bId, bName, bComment, bDescription, bStorageType, bVersion, bQuotaMode, bStatus, bDomainStatus, bClusterCnt, bHostCnt, bClusterVos, bNetworkVos, bStorageDomainVos, )
	}

	companion object {
		inline fun builder(block: DataCenterVo.Builder.() -> Unit): DataCenterVo = DataCenterVo.Builder().apply(block).build()
	}
}

/**
 * 데이터센터 아이디, 이름
 */
fun DataCenter.toDataCenterIdName(): DataCenterVo = DataCenterVo.builder {
	id { this@toDataCenterIdName.id() }
	name { this@toDataCenterIdName.name() }
}
fun List<DataCenter>.toDataCenterIdNames(): List<DataCenterVo> =
	this@toDataCenterIdNames.map { it.toDataCenterIdName() }

/**
 * 데이터센터 메뉴 목록
 *
 * @param conn [Connection]
 * @return [DataCenterVo]
 */
fun DataCenter.toDataCenterMenu(conn: Connection): DataCenterVo {
	val dc = this@toDataCenterMenu
	val hostSize = conn.findAllHostsFromDataCenter(dc.id()).getOrDefault(listOf()).size
	return DataCenterVo.builder {
		id { dc.id() }
		name { dc.name() }
		comment { dc.comment() }
		description { dc.description() }
		storageType { dc.local() }
		status { dc.status() }
		version { dc.version().major().toString() + "." + dc.version().minor() }
		clusterCnt { dc.clusters().size }
		hostCnt { hostSize }
	}
}
fun List<DataCenter>.toDataCentersMenu(conn: Connection): List<DataCenterVo> =
	this@toDataCentersMenu.map { it.toDataCenterMenu(conn) }


/**
 * 데이터센터 상세정보(편집창)
 * 위의 toDataCenterMenu 와 클러스터&호스트 개수만 다름
 */
fun DataCenter.toDataCenterVoInfo(): DataCenterVo {
	val dc = this@toDataCenterVoInfo
	return DataCenterVo.builder {
		id { dc .id() }
		name { dc.name() }
		comment { dc.comment() }
		description { dc.description() }
		storageType { dc.local() }
		status { dc.status() }
		quotaMode { dc.quotaMode() }
		version { dc.version().major().toString() + "." + dc.version().minor() }
	}
}

fun DataCenter.toDataCenterVo(
	conn: Connection?,
	findNetworks: Boolean = true,
	findStorageDomains: Boolean = true,
	findClusters: Boolean = true
): DataCenterVo {
	log.debug("DataCenter.toDataCenterVo ... findNetworks: {}, findStorageDomains: {}, findClusters: {}", findNetworks, findStorageDomains, findClusters)
	val networks: List<Network> = (conn?.findAllNetworks()?.getOrNull() ?: listOf()).filter {
		it.dataCenter().id() == this@toDataCenterVo.id()
	}
	val storageDomains: List<StorageDomain> =
		conn?.findAllStorageDomains()?.getOrDefault(listOf())
			?.filter { it.dataCentersPresent() && it.dataCenters().first().id() == this@toDataCenterVo.id() } ?: listOf()
	val clusters: List<Cluster> = (conn?.findAllClusters()?.getOrDefault(listOf()))?.filter {
		it.dataCenterPresent() && it.dataCenter().id() == this@toDataCenterVo.id()
	} ?: listOf()

	val storageDomainVoList: List<StorageDomainVo> = if (conn == null || !findStorageDomains) listOf() else storageDomains.toStorageDomainIdNames()
//	val storageDomainVos: List<IdentifiedVo> = if (conn == null || !findStorageDomains) listOf() else storageDomains.fromStorageDomainsToIdentifiedVos()
	val networkVos: List<IdentifiedVo> = if (conn == null || !findNetworks) listOf() else networks.fromNetworksToIdentifiedVos()
	val clusterVos: List<IdentifiedVo> = if (conn == null || !findClusters) listOf() else clusters.fromClustersToIdentifiedVos()

	return DataCenterVo.builder {
		id { this@toDataCenterVo.id() }
		name { this@toDataCenterVo.name() }
		storageType { this@toDataCenterVo.local() }
		clusterVos { clusterVos }
		networkVos { networkVos }
		storageDomainVos { storageDomainVoList }
	}
}
fun List<DataCenter>.toDataCenterVos(
	conn: Connection?,
	findClusters: Boolean = true,
	findNetworks: Boolean = true,
	findStorageDomains: Boolean = true
): List<DataCenterVo> =
	this@toDataCenterVos.map { it.toDataCenterVo(conn, findClusters, findNetworks, findStorageDomains) }

fun StorageDomain.toStorageDomainDataCenter(conn: Connection): List<DataCenterVo> {
	val dataCenterIds =
		if (this@toStorageDomainDataCenter.dataCentersPresent())
			this@toStorageDomainDataCenter.dataCenters().map { it.id() }
		else listOf()

	return dataCenterIds.mapNotNull { dataCenterId ->
		val dataCenter = conn.findDataCenter(dataCenterId, "storagedomains").getOrNull()
		val storageDomainStatus = dataCenter?.storageDomains()?.find { it.id() == this@toStorageDomainDataCenter.id() }?.status()

		dataCenter?.let {
			DataCenterVo.builder {
				id { dataCenter.id() }
				name { dataCenter.name() }
				domainStatus { storageDomainStatus }
			}
		}
	}
}


// region: builder
/**
 * 데이터센터 빌더
 */
fun DataCenterVo.toDataCenterBuilder(): DataCenterBuilder = DataCenterBuilder()
	.name(this@toDataCenterBuilder.name) // 이름
	.description(this@toDataCenterBuilder.description) // 설명
	.local(this@toDataCenterBuilder.storageType) // 스토리지 유형
	.version(VersionBuilder().major(4).minor(7)) // 버전 고정
	.quotaMode(this@toDataCenterBuilder.quotaMode)
	.comment(this@toDataCenterBuilder.comment)

/**
 * 데이터센터 생성 빌더
 */
fun DataCenterVo.toAddDataCenterBuilder(): DataCenter =
	this@toAddDataCenterBuilder.toDataCenterBuilder()
		.build()

/**
 * 데이터센터 편집 빌더
 */
fun DataCenterVo.toEditDataCenterBuilder(): DataCenter =
	this@toEditDataCenterBuilder.toDataCenterBuilder()
		.id(this@toEditDataCenterBuilder.id)
		.build()

// endregion
