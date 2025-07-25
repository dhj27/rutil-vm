package com.itinfo.rutilvm.api.repository.engine.entity

import com.itinfo.rutilvm.api.model.IdentifiedVo
import com.itinfo.rutilvm.api.model.auth.UserSessionVo
import com.itinfo.rutilvm.api.model.computing.ClusterVo
import com.itinfo.rutilvm.api.model.computing.DataCenterVo
import com.itinfo.rutilvm.api.model.computing.EventVo
import com.itinfo.rutilvm.api.model.computing.HostVo
import com.itinfo.rutilvm.api.model.computing.SnapshotVo
import com.itinfo.rutilvm.api.model.computing.TemplateVo
import com.itinfo.rutilvm.api.model.computing.VmIconVo
import com.itinfo.rutilvm.api.model.computing.VmVo
import com.itinfo.rutilvm.api.model.fromClusterToIdentifiedVo

import com.itinfo.rutilvm.api.model.storage.DiskAttachmentVo
import com.itinfo.rutilvm.api.model.storage.DiskImageVo

import com.itinfo.rutilvm.api.model.storage.StorageDomainVo
import com.itinfo.rutilvm.api.ovirt.business.CpuPinningPolicyB
import com.itinfo.rutilvm.api.ovirt.business.DiskContentType
import com.itinfo.rutilvm.api.ovirt.business.DiskStatus
import com.itinfo.rutilvm.api.ovirt.business.DiskStorageType
import com.itinfo.rutilvm.api.ovirt.business.StorageDomainStatusB
import com.itinfo.rutilvm.api.ovirt.business.StorageDomainTypeB
import com.itinfo.rutilvm.api.ovirt.business.StorageTypeB
import com.itinfo.rutilvm.api.ovirt.business.SnapshotType
import com.itinfo.rutilvm.api.ovirt.business.StoragePoolStatus
import com.itinfo.rutilvm.api.ovirt.business.StoragePoolStatus.Companion
import com.itinfo.rutilvm.api.ovirt.business.findArchitectureType
import com.itinfo.rutilvm.api.ovirt.business.findBiosTypeB
import com.itinfo.rutilvm.api.ovirt.business.findGraphicsTypeB
import com.itinfo.rutilvm.api.ovirt.business.findStatus
import com.itinfo.rutilvm.api.ovirt.business.findTemplateStatus
import com.itinfo.rutilvm.api.ovirt.business.findVmOsType
import com.itinfo.rutilvm.api.ovirt.business.toBootDevices
import com.itinfo.rutilvm.api.ovirt.business.toDataCenterStatus
import com.itinfo.rutilvm.api.ovirt.business.toVmTypeB
import com.itinfo.rutilvm.api.repository.history.dto.UsageDto
import com.itinfo.rutilvm.common.toDate
import com.itinfo.rutilvm.common.toLocalDateTime
import com.itinfo.rutilvm.util.ovirt.cpuTopologyAll
import com.itinfo.rutilvm.util.ovirt.cpuTopologyAll4Template
import com.itinfo.rutilvm.util.ovirt.findCluster
import com.itinfo.rutilvm.util.ovirt.findStorageDomain
import org.ovirt.engine.sdk4.Connection
import org.ovirt.engine.sdk4.types.Disk
import org.ovirt.engine.sdk4.types.StorageDomain
import org.ovirt.engine.sdk4.types.Template
import org.ovirt.engine.sdk4.types.Vm
import org.springframework.data.domain.Page

//region: AuditLogEntity
fun AuditLogEntity.toEventVo(): EventVo = EventVo.builder {
	id { this@toEventVo.auditLogId.toString() }
	severity { this@toEventVo.severity }
	description { this@toEventVo.message }
	time { this@toEventVo.logTime }
	code { this@toEventVo.logType }
	correlationId { this@toEventVo.correlationId }
}
fun List<AuditLogEntity>.toEventVos(): List<EventVo> =
	this@toEventVos.map { it.toEventVo() }
fun Page<AuditLogEntity>.toEventVosPage(): Page<EventVo> =
	this@toEventVosPage.map { it.toEventVo() }
//endregion: AuditLogEntity


//region: DiskVmElementEntity
fun DiskVmElementEntity.toVmDisk(): DiskImageVo {
	return DiskImageVo.builder {

	}
}
//endregion: DiskVmElementEntity

//region: AllDiskEntity
fun AllDiskEntity.toDiskEntity(): DiskImageVo {
	val entity = this@toDiskEntity
	return DiskImageVo.builder {
		id { entity.diskId.toString() }
		alias { entity.diskAlias }
		sharable { entity.shareable }
		virtualSize { entity.size }
		actualSize { entity.actualSize }
		status { DiskStatus.forValue(entity.imagestatus) }
		contentType { diskContentType }
		storageType { entity.diskStorageType }
		sparse { entity.volumeType == 2 }
		description { entity.description }
		dateCreated { entity.creationDate }
		dataCenterVo {
			IdentifiedVo.builder {
				id { entity.storagePoolId.toString() }
			}
		}
		diskProfileVo {
			IdentifiedVo.builder {
				id { entity.diskProfileId }
				name { entity.diskProfileName }
			}
		}
		storageDomainVo {
			IdentifiedVo.builder {
				id { entity.storageId }
				name { entity.storageName }
			}
		}
		type { entity.entityType }
		connectVm {
			if(entity.entityType == "VM") {
				IdentifiedVo.builder {
					name { entity.vmNames }
				}
			}
			else null
		}
		connectTemplate {
			if(entity.entityType == "TEMPLATE") {
				IdentifiedVo.builder {
					name { entity.vmNames }
				}
			}
			else null
		}
	}
}
fun List<AllDiskEntity>.toDiskEntities(): List<DiskImageVo> =
	this@toDiskEntities.map { it.toDiskEntity() }

//endregion: AllDiskEntity

//region: StorageDomainEntity
fun StorageDomainEntity.toStorageDomainEntity(): StorageDomainVo {
	return StorageDomainVo.builder {
		id { id.toString() }
		name { storageName }
		description { storageDescription }
		status { status }
		storagePoolStatus { StoragePoolStatus.forValue(storageDomainSharedStatus) }
		storageType { storageType }
		storageDomainType { storageDomainType }
		// storageVo { storage().toStorageVo() }
		// master { master() }
		hostedEngine { isHostedEngineStorage }
		comment { storageComment }
		size { usedDiskSize?.add(availableDiskSize) }
		usedSize { usedDiskSize }
		availableSize { availableDiskSize }
		dataCenterVo { IdentifiedVo.builder {
			id { storagePoolId.toString() }
			name { storagePoolName }
		} }
	}
}
fun List<StorageDomainEntity>.toStorageDomainEntities(): List<StorageDomainVo> =
	this@toStorageDomainEntities.map { it.toStorageDomainEntity() }
//endregion: StorageDomainEntity


//region: EngineSessionsEntity
fun EngineSessionsEntity.toUserSessionVo(): UserSessionVo {
	return UserSessionVo.builder {
		id { id }
		userId { userId }
		userName { userName }
		sourceIp { sourceIp }
		authzName { authzName }
		sessionStartTime { null }
		sessionLastActiveTime { null }
		// TODO: sessionLastActiveTime, sessionStartTime 값 찾아 넣기
	}
}
fun List<EngineSessionsEntity>.toUserSessionVos(): List<UserSessionVo> =
	this@toUserSessionVos.map { it.toUserSessionVo() }
//endregion: EngineSessionsEntity


//region: StoragePoolEntity
fun StoragePoolEntity.toDataCenterVo(): DataCenterVo = DataCenterVo.builder {
	id { this@toDataCenterVo.id.toString() }
	name { this@toDataCenterVo.name }
	comment { this@toDataCenterVo.freeTextComment }
	description { this@toDataCenterVo.description }
	storageType { this@toDataCenterVo.isLocal }
	version { this@toDataCenterVo.compatibilityVersion }
	versionMajor { this@toDataCenterVo.majorVersion }
	versionMinor { this@toDataCenterVo.minorVersion }
	status { this@toDataCenterVo.status }
	// domainStatus {  }
	// storageDomainVos {  }
	clusterCnt { this@toDataCenterVo.clusters?.size ?: 0 }
	clusterVos { this@toDataCenterVo.clusters?.toClusterVosFromClusterViewEntities() }
	quotaMode { this@toDataCenterVo.quotaEnforcementType }
}
fun Collection<StoragePoolEntity>.toDataCenterVos(): List<DataCenterVo> =
	this@toDataCenterVos.map { it.toDataCenterVo() }
fun StoragePoolEntity.toIdentifiedVoFromStoragePoolEntity(): IdentifiedVo = IdentifiedVo.builder {
	id { this@toIdentifiedVoFromStoragePoolEntity.id.toString() }
	id { this@toIdentifiedVoFromStoragePoolEntity.name }
}
fun Collection<StoragePoolEntity>.toIdentifiedVosFromStoragePoolEntities(): List<IdentifiedVo> =
	this@toIdentifiedVosFromStoragePoolEntities.map { it.toIdentifiedVoFromStoragePoolEntity() }
//endregion: StoragePoolEntity

//region: ClusterViewEntity
fun ClusterViewEntity.toClusterVoFromClusterViewEntity(): ClusterVo = ClusterVo.builder {
	id { this@toClusterVoFromClusterViewEntity.clusterId.toString() }
	name { this@toClusterVoFromClusterViewEntity.name }
	description { this@toClusterVoFromClusterViewEntity.description }
	comment { this@toClusterVoFromClusterViewEntity.freeTextComment }
	// isConnected { this@toClusterVoFromClusterViewEntity. }
	ballooningEnabled { this@toClusterVoFromClusterViewEntity.enableBalloon }
	biosType { this@toClusterVoFromClusterViewEntity.biosType }
	cpuArc { this@toClusterVoFromClusterViewEntity.architecture }
	// cpuType { this@toClusterVoFromClusterViewEntity }
	errorHandling { this@toClusterVoFromClusterViewEntity.migrateOnError }
	fipsMode { this@toClusterVoFromClusterViewEntity.fipsMode }
	firewallType { this@toClusterVoFromClusterViewEntity.firewallType }
	glusterService { this@toClusterVoFromClusterViewEntity.glusterService }
	haReservation { this@toClusterVoFromClusterViewEntity.haReservation }
	// logMaxMemory { this@toClusterVoFromClusterViewEntity.logMaxMemoryUsedThreshold }
}
fun Collection<ClusterViewEntity>.toClusterVosFromClusterViewEntities(): List<ClusterVo> =
	this@toClusterVosFromClusterViewEntities.map { it.toClusterVoFromClusterViewEntity() }

fun ClusterViewEntity.toIdentifiedVoFromClusterViewEntity(): IdentifiedVo = IdentifiedVo.builder {
	id { this@toIdentifiedVoFromClusterViewEntity.clusterId.toString() }
	name { this@toIdentifiedVoFromClusterViewEntity.name }
}
fun Collection<ClusterViewEntity>.toIdentifiedVosFromClusterViewEntities(): List<IdentifiedVo> =
	this@toIdentifiedVosFromClusterViewEntities.map { it.toIdentifiedVoFromClusterViewEntity() }


//endregion: ClusterViewEntity

//region: UnregisteredDiskEntity
fun UnregisteredDiskEntity.toUnregisteredDiskImageVo(disk: Disk?=null): DiskImageVo =
	DiskImageVo.builder {
		id { this@toUnregisteredDiskImageVo.id.diskId.toString() }
		alias { this@toUnregisteredDiskImageVo.diskAlias }
		sharable { disk?.shareable() }
		virtualSize { this@toUnregisteredDiskImageVo.size }
		actualSize { this@toUnregisteredDiskImageVo.actualSize }
		sparse { this@toUnregisteredDiskImageVo.sparse }
		description { this@toUnregisteredDiskImageVo.diskDescription }
		dateCreated { this@toUnregisteredDiskImageVo.creationDate }
	}

fun List<UnregisteredDiskEntity>.toUnregisteredDiskImageVos(disks: List<Disk>): List<DiskImageVo> {
	val itemById: Map<String, Disk> =
		disks.associateBy { it.id() }
	return this.map { it.toUnregisteredDiskImageVo(itemById[it.id.toString()]) }
}
//endregion: UnregisteredDiskEntity


//region: UnregisteredOvfOfEntities
fun UnregisteredOvfOfEntities.toUnregisteredVm(vm: Vm?=null): VmVo {
	// val tmp = conn.findTemplate(vm.template().id()).getOrNull()
	return VmVo.builder {
		id { this@toUnregisteredVm.id?.entityGuid.toString() }
		name { this@toUnregisteredVm.ovf?.virtualSystem?.name }
		description { this@toUnregisteredVm.ovf?.virtualSystem?.description }
		comment { this@toUnregisteredVm.ovf?.virtualSystem?.comment }
		status { vm?.findStatus() }
		// templateVo { tmp?.fromTemplateToIdentifiedVo() }
		optimizeOption { vm?.type()?.toVmTypeB() }
		nextRun { vm?.nextRunConfigurationExists() }
		biosType { vm?.bios()?.findBiosTypeB() }
		biosBootMenu { vm?.bios()?.bootMenu()?.enabled() }
		osType { vm?.os()?.findVmOsType() }
		cpuArc { vm?.cpu()?.findArchitectureType() }
		cpuTopologyCnt { vm.cpuTopologyAll() }
		cpuTopologyCore { vm?.cpu()?.topology()?.coresAsInteger() }
		cpuTopologySocket { vm?.cpu()?.topology()?.socketsAsInteger() }
		cpuTopologyThread { vm?.cpu()?.topology()?.threadsAsInteger() }
		cpuPinningPolicy {
			this@toUnregisteredVm.ovf?.virtualSystem?.cpuPinningPolicy
		}
		creationTime {
			// NOTE: 환산에 문제가 있는것으로 판단. 값이 좀 이상함 Locale 때문에 차이가 생김
			// ovf?.virtualSystem?.creationDate?.toDate()
			vm?.creationTime().toLocalDateTime()
		}
		monitor { if (vm?.displayPresent() == true) vm.display().monitorsAsInteger() else 0 }
		displayType {  vm?.display().findGraphicsTypeB() }
		ha { vm?.highAvailability()?.enabled() }
		haPriority { vm?.highAvailability()?.priorityAsInteger() }
		memorySize { vm?.memory() }
		memoryGuaranteed { vm?.memoryPolicy()?.guaranteed() }
		memoryMax { vm?.memoryPolicy()?.max() }
		usb { if(vm?.usbPresent() == true) vm.usb()?.enabled() else false }
		diskAttachmentVos { disksFromOvf.toDiskAttachmentIdentifiedVos() }
	}
}
fun UnregisteredOvfOfEntities.toUnregisteredTemplate(template: Template?=null): TemplateVo {
	// val tmp = conn.findTemplate(vm.template().id()).getOrNull()
	return TemplateVo.builder {
		id { this@toUnregisteredTemplate.id?.entityGuid.toString() }
		name { this@toUnregisteredTemplate.ovf?.virtualSystem?.name }
		description { this@toUnregisteredTemplate.ovf?.virtualSystem?.description }
		comment { this@toUnregisteredTemplate.ovf?.virtualSystem?.comment }
		status { template?.findTemplateStatus() }
		// templateVo { tmp?.fromTemplateToIdentifiedVo() }
		biosType { template?.bios()?.findBiosTypeB() }
		cpuArc { template?.cpu()?.findArchitectureType() }
		cpuTopologyCnt { template.cpuTopologyAll4Template() }
		cpuTopologyCore { template?.cpu()?.topology()?.coresAsInteger() }
		cpuTopologySocket { template?.cpu()?.topology()?.socketsAsInteger() }
		cpuTopologyThread { template?.cpu()?.topology()?.threadsAsInteger() }
		cpuPinningPolicy {
			CpuPinningPolicyB.forCode("${this@toUnregisteredTemplate.ovf?.virtualSystem?.cpuPinningPolicy}")
			// template?.cpuPinningPolicy()?.value()
		}
		creationTime {
			// NOTE: 환산에 문제가 있는것으로 판단. 값이 좀 이상함 Locale 때문에 차이가 생김
			// ovf?.virtualSystem?.creationDate?.toDate()
			template?.creationTime().toLocalDateTime()
		}
		monitor { if (template?.displayPresent() == true) template.display().monitorsAsInteger() else 0 }
		displayType { template?.display().findGraphicsTypeB() }
		ha { template?.highAvailability()?.enabled() }
		haPriority { template?.highAvailability()?.priorityAsInteger() }
		memorySize { template?.memory() }
		memoryGuaranteed { template?.memoryPolicy()?.guaranteed() }
		memoryMax { template?.memoryPolicy()?.max() }
		osType { template?.os()?.findVmOsType() }
		optimizeOption { template?.type()?.toVmTypeB() }
		usb { if(template?.usbPresent() == true) template.usb()?.enabled() else false }
		diskAttachmentVos { disksFromOvf.toDiskAttachmentIdentifiedVos() }
	}
}

fun OvfDisk.toDiskAttachmentIdentifiedVo(): DiskAttachmentVo = DiskAttachmentVo.builder {
	id { this@toDiskAttachmentIdentifiedVo.diskId }
	diskImageVo {
		DiskImageVo.builder {
			id { this@toDiskAttachmentIdentifiedVo.diskId }
			alias { this@toDiskAttachmentIdentifiedVo.diskAlias }
			description{ this@toDiskAttachmentIdentifiedVo.diskDescription }
			sparse{ this@toDiskAttachmentIdentifiedVo.volumeType == "Sparse" }
			actualSize { this@toDiskAttachmentIdentifiedVo.actualSize?.toBigInteger() }
			size { this@toDiskAttachmentIdentifiedVo.size?.toBigInteger() }
		}
	}
}

fun List<OvfDisk>.toDiskAttachmentIdentifiedVos(): List<DiskAttachmentVo> =
	this@toDiskAttachmentIdentifiedVos.map { it.toDiskAttachmentIdentifiedVo() }

fun List<UnregisteredOvfOfEntities>.toUnregisteredVms(vms: List<Vm>): List<VmVo> {
	val itemById: Map<String, Vm> =
		vms.associateBy { it.id() }
	return this@toUnregisteredVms.map { it.toUnregisteredVm(itemById[it.id?.entityGuid.toString()]) }
}

fun List<UnregisteredOvfOfEntities>.toUnregisteredTemplates(templates: List<Template>): List<TemplateVo> {
	val itemById: Map<String, Template> =
		templates.associateBy { it.id() }
	return this@toUnregisteredTemplates.map {
		it.toUnregisteredTemplate(itemById[it.id?.entityGuid.toString()])
	}
}
//endregion: UnregisteredOvfOfEntities


//region: VmEntity
fun VmEntity.toVmVo(): VmVo {
	val entity = this@toVmVo

	return VmVo.builder {
		id { entity.vmGuid.toString() }
		name { entity.vmName }
		description { entity.description }
		comment { entity.freeTextComment }
		status { entity.status }
		iconSmall { entity.effectiveSmallIcon?.toVmIconVoFromVmEntity() }
		iconLarge { entity.effectiveLargeIcon?.toVmIconVoFromVmEntity() }
		creationTime { entity.creationDate }
		stopTime { entity.lastStopTime }
		timeElapsed { entity.elapsedTime?.toLong() }
		optimizeOption { entity.vmType }
		nextRun { entity.nextRunConfigExists }
		biosType { entity.biosType }
		biosBootMenu { entity.isBootMenuEnabled }
		osType { entity.osType }
		cpuArc { entity.architecture }
		cpuTopologyCnt { entity.numOfCpus }
		cpuTopologyCore { entity.cpuPerSocket } // TODO: 이거 맞는지 모르겠음
		cpuTopologySocket { entity.numOfSockets }
		cpuTopologyThread { entity.threadsPerCpu } // TODO: 이거 맞는지 모르겠음
		cpuPinningPolicy { entity.cpuPinningPolicy }
		memorySize { entity.memSize }
		memoryGuaranteed { entity.memSize }
		memoryMax { entity.maxMemorySize }
		deleteProtected { entity.isDeleteProtected }
		monitor { entity.numOfMonitors }
		displayType { entity.defaultDisplayType }
		ha { entity.autoStartup }
		haPriority { entity.priority }
		ioThreadCnt { entity.numOfIoThreads } // TODO: 이거 맞는지 모르겠음
		migrationMode { entity.migrationSupport }
		migrationEncrypt { entity.isMigrateEncrypted }
		migrationAutoConverge { entity.isAutoConverge }
		migrationCompression { entity.isMigrateCompressed }
		firstDevice {
			entity.defaultBootSequence?.toBootDevices()?.firstOrNull()?.value()
		}
		secDevice {
			if ((entity.defaultBootSequence?.toBootDevices()?.size ?: 0) > 1) entity.defaultBootSequence?.toBootDevices()?.get(1)?.value()
			else null
		}
		hostInCluster { entity.dedicatedVmForVds.isNullOrEmpty() }
		startPaused { entity.isRunAndPause }
		storageErrorResumeBehaviour { entity.vmResumeBehavior }
		usb { entity.usbPolicy?.isEnabled }
		virtioScsiMultiQueueEnabled { entity.virtioScsiMultiQueuesEnabled }
		hostedEngineVm { entity.isHostedEngineVm }
		// timeOffset {  }
		usageDto {
			UsageDto.builder {
				cpuPercent { usageCpuPercent }
				memoryPercent { usageMemPercent }
				networkPercent { usageNetworkPercent }
			}
		}
		ipv4 { listOf(entity.vmIp) }
		fqdn { entity.vmHost }
		cdRomVo {
			IdentifiedVo.builder {
				id { entity.isoPath }
			}
		}
		templateVo {
			IdentifiedVo.builder {
				id { entity.originalTemplateId.toString() }
				name { entity.originalTemplateName }
			}
		}
		hostVo {
			IdentifiedVo.builder {
				id { entity.runOnVds.toString() }
				name { entity.runOnVdsName }
			}
		}
		clusterVo {
			IdentifiedVo.builder {
				id { entity.clusterId.toString() }
				name { entity.clusterName }
			}
		}
		dataCenterVo {
			IdentifiedVo.builder {
				id { entity.storagePoolId.toString() }
				name { entity.storagePoolName }
			}
		}
		storageDomainVo {
			IdentifiedVo.builder {
				id { entity.leaseSdId.toString() }
				// name { entity. }
			}
		}
		snapshotVos { snapshots.filter {
			it.snapshotType != SnapshotType.active &&
				it.snapshotType != SnapshotType.preview
		}.toIdentifiedVosFromSnapshotEntities() }
	}
}
fun List<VmEntity>.toVmVos(): List<VmVo> {
	return this@toVmVos.map { it.toVmVo() }
}


fun VmEntity.toVmVoFromVmEntity(vm: Vm?): VmVo {
	val entity = this@toVmVoFromVmEntity
	val hosts: List<IdentifiedVo> = if (entity.dedicatedVmForVds.isNullOrEmpty()) {
		emptyList()
	} else entity.dedicatedVmForVds!!
		.split(",")
		.mapNotNull { id ->
			id.trim().takeIf { it.isNotEmpty() }?.let {
				IdentifiedVo.builder {
					id { it }
					name { "" }
				}
			}
		}


	return VmVo.builder {
		id { entity.vmGuid.toString() }
		name { entity.vmName }
		description { entity.description }
		comment { entity.freeTextComment }
		status { entity.status }
		iconSmall { entity.effectiveSmallIcon?.toVmIconVoFromVmEntity() }
		iconLarge { entity.effectiveLargeIcon?.toVmIconVoFromVmEntity() }
		creationTime { entity.creationDate }
		stopTime { entity.lastStopTime }
		timeElapsed { entity.elapsedTime?.toLong() }
		optimizeOption { entity.vmType }
		nextRun { entity.nextRunConfigExists }
		biosType { entity.biosType }
		biosBootMenu { entity.isBootMenuEnabled }
		osType { entity.osType }
		cpuArc { entity.architecture }
		cpuTopologyCnt { entity.numOfCpus }
		cpuTopologyCore { entity.cpuPerSocket } // TODO: 이거 맞는지 모르겠음
		cpuTopologySocket { entity.numOfSockets }
		cpuTopologyThread { entity.threadsPerCpu } // TODO: 이거 맞는지 모르겠음
		cpuPinningPolicy { entity.cpuPinningPolicy }
		memorySize { entity.memSize }
		memoryGuaranteed { entity.memSize }
		memoryMax { entity.maxMemorySize }
		deleteProtected { entity.isDeleteProtected }
		monitor { entity.numOfMonitors }
		displayType { entity.defaultDisplayType }
		ha { entity.autoStartup }
		haPriority { entity.priority }
		ioThreadCnt { entity.numOfIoThreads } // TODO: 이거 맞는지 모르겠음
		migrationMode { entity.migrationSupport }
		migrationEncrypt { entity.isMigrateEncrypted }
		migrationAutoConverge { entity.isAutoConverge }
		migrationCompression { entity.isMigrateCompressed }
		firstDevice {
			entity.defaultBootSequence?.toBootDevices()?.firstOrNull()?.value()
		}
		secDevice {
			if ((entity.defaultBootSequence?.toBootDevices()?.size ?: 0) > 1) entity.defaultBootSequence?.toBootDevices()?.get(1)?.value()
			else null
		}
		hostInCluster { entity.dedicatedVmForVds.isNullOrEmpty() }
		startPaused { entity.isRunAndPause }
		storageErrorResumeBehaviour { entity.vmResumeBehavior }
		usb { entity.usbPolicy?.isEnabled }
		virtioScsiMultiQueueEnabled { entity.virtioScsiMultiQueuesEnabled }
		hostedEngineVm { entity.isHostedEngineVm }
		// timeOffset {  }
		usageDto {
			UsageDto.builder {
				cpuPercent { usageCpuPercent }
				memoryPercent { usageMemPercent }
				networkPercent { usageNetworkPercent }
			}
		}
		ipv4 { listOf(entity.vmIp) }
		fqdn { entity.vmHost }
		hostVos { hosts }
		cdRomVo {
			IdentifiedVo.builder {
				id { entity.isoPath }
			}
		}
		templateVo {
			IdentifiedVo.builder {
				id { entity.originalTemplateId.toString() }
				name { entity.originalTemplateName }
			}
		}
		hostVo {
			IdentifiedVo.builder {
				id { entity.runOnVds.toString() }
				name { entity.runOnVdsName }
			}
		}
		clusterVo {
			IdentifiedVo.builder {
				id { entity.clusterId.toString() }
				name { entity.clusterName }
			}
		}
		dataCenterVo {
			IdentifiedVo.builder {
				id { entity.storagePoolId.toString() }
				name { entity.storagePoolName }
			}
		}
		storageDomainVo {
			IdentifiedVo.builder {
				id { entity.leaseSdId.toString() }
				// name { entity. }
			}
		}
		snapshotVos { snapshots.filter {
			it.snapshotType != SnapshotType.active &&
			it.snapshotType != SnapshotType.preview
		}.toIdentifiedVosFromSnapshotEntities() }
	}
}

fun List<VmEntity>.toVmVosFromVmEntities(vms: List<Vm>? = null): List<VmVo> {  // TODO: 다 연결 되었을 때 vms없이 mapping
	val itemById: Map<String, Vm>? =
		vms?.associateBy { it.id() }
	return this@toVmVosFromVmEntities.map { it.toVmVoFromVmEntity(itemById?.get(it.vmGuid.toString())) }
}

fun VmEntity.toIdentifiedVoFromVmEntity(): IdentifiedVo = IdentifiedVo.builder {
	id { this@toIdentifiedVoFromVmEntity.vmGuid.toString() }
	name { this@toIdentifiedVoFromVmEntity.vmName }
}
fun List<VmEntity>.toIdentifiedVosFromVoEntities(): List<IdentifiedVo> =
	this@toIdentifiedVosFromVoEntities.map { it.toIdentifiedVoFromVmEntity() }
//endregion: VmEntity

//region: VmIconEntity
fun VmIconEntity.toVmIconVoFromVmEntity(): VmIconVo = VmIconVo.builder {
	id { this@toVmIconVoFromVmEntity.id.toString() }
	dataUrl { this@toVmIconVoFromVmEntity.dataUrl }
}
fun List<VmIconEntity>.toVmIconVosFromVmIconEntities(): List<VmIconVo> =
	this@toVmIconVosFromVmIconEntities.map { it.toVmIconVoFromVmEntity() }
//endregion: VmIconEntity


//region: SnapshotEntity
fun SnapshotEntity.fromSnapshotEntityToSnapshotVo(): SnapshotVo = SnapshotVo.builder {
	val entity = this@fromSnapshotEntityToSnapshotVo
	id { entity.snapshotId.toString() }
	description { entity.description }
	status { entity.status }
	date { entity.creationDate.toDate() }
	// persistMemory { entity. }
	// vmVo {  }
	// snapshotDiskVos { entity }
	// nicVos { }
	applicationVos {
		entity.appList.split(",").map {
			IdentifiedVo.builder {
				// id {  }
				// name {  }
			}
		}
	}
	// diskAttachmentVos { }
}
fun SnapshotEntity.toIdentifiedVoFromSnapshotEntity(): IdentifiedVo = IdentifiedVo.builder {
	id { this@toIdentifiedVoFromSnapshotEntity.snapshotId.toString() }
	name { this@toIdentifiedVoFromSnapshotEntity.description }
}
fun Collection<SnapshotEntity>.toIdentifiedVosFromSnapshotEntities(): List<IdentifiedVo> =
	this@toIdentifiedVosFromSnapshotEntities.map { it.toIdentifiedVoFromSnapshotEntity() }

//endregion: SnapshotEntity


//region: DwhHostConfigurationFullCheckEntity
fun DwhHostConfigurationFullCheckEntity.fromDwhHostConfigurationFullCheckToHostVo(conn: Connection): HostVo = HostVo.builder {
	val entity = this@fromDwhHostConfigurationFullCheckToHostVo
	val cluster = conn.findCluster(entity.clusterId.toString()).getOrNull()
	id { entity.hostId.toString() }
	name { entity.hostName }
	clusterVo { cluster?.fromClusterToIdentifiedVo() }
	memoryTotal { entity.memorySizeMb?.toBigInteger() }
	// comment { entity.comment }
	// status { entity.status() }
	// ksm { entity.ksm().enabled() }
	// hostedEngine {
	// 	if (entity.hostedEnginePresent())
	// 		entity.hostedEngine().toHostedEngineVo()
	// 	else
	// 		null
	// }
	// hostedEngineVM { hostedVm }
	address { entity.fqdnOrIp }
	// ssh { entity.ssh().toSshVo() }
	// clusterVo { entity.cluster()?.fromClusterToIdentifiedVo() }
	// dataCenterVo { dataCenter?.fromDataCenterToIdentifiedVo() }
	// vmSizeVo { host.findVmCntFromHost() }
	// usageDto { usageDto }
	// spmStatus { entity.spm().status() }
	// bootingTime { Date(statistics.findBootTime() * 1000) }
}


//endregion: DwhHostConfigurationFullCheckEntity

//region: VmTemplateEntity

fun VmTemplateEntity.fromVmTemplateToIdentifiedVo(): IdentifiedVo = IdentifiedVo.builder {
	id { this@fromVmTemplateToIdentifiedVo.vmtGuid.toString() }
	name { this@fromVmTemplateToIdentifiedVo.name }
}
fun List<VmTemplateEntity>.fromVmTemplateToIdentifiedVos(): List<IdentifiedVo> =
	this@fromVmTemplateToIdentifiedVos.map { it.fromVmTemplateToIdentifiedVo() }


fun VmTemplateEntity.fromVmTemplateToTemplateVo(): TemplateVo = TemplateVo.builder {
	val entity = this@fromVmTemplateToTemplateVo
	id { entity.vmtGuid.toString() }
	name { entity.name }
	comment { entity.freeTextComment }
	description { entity.description }
	status { entity.status }
	iconSmall { entity.effectiveSmallIcon?.toVmIconVoFromVmEntity() }
	iconLarge { entity.effectiveLargeIcon?.toVmIconVoFromVmEntity() }
	creationTime { entity.creationDate }
	osType { entity.osType }
	// biosType { entity.biosType } // cluster_biosType
	// optimizeOption { entity.vmType } // 최적화 옵션 entity.type().findVmType()
	// memorySize { entity.memSizeMb }
	// cpuTopologyCore { entity.per }
	// cpuArc { entity.architecture }
	cpuTopologyCnt { entity.numOfCpus }
	cpuTopologyCore { entity.cpuPerSocket } // TODO: 이거 맞는지 모르겠음
	cpuTopologySocket { entity.numOfSockets }
	cpuTopologyThread { entity.threadsPerCpu } // TODO: 이거 맞는지 모르겠음
	// displayType { entity.defaultDisplayType }
	// ha {  }
	haPriority { entity.priority }
	monitor { entity.numOfMonitors }
	clusterVo {
		IdentifiedVo.builder {
			id { entity.clusterId.toString() }
			name { entity.clusterName }
		}
	}
	dataCenterVo {
		IdentifiedVo.builder {
			id { entity.storagePoolId.toString() }
			name { entity.storagePoolName }
		}
	}
}


//endregion: VmTemplateEntity
