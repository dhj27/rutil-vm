package com.itinfo.rutilvm.api.ovirt.business

import com.itinfo.rutilvm.common.deepEquals
import org.ovirt.engine.sdk4.types.Architecture
import org.ovirt.engine.sdk4.types.Bios
import org.ovirt.engine.sdk4.types.BiosType
import org.ovirt.engine.sdk4.types.BootDevice
import org.ovirt.engine.sdk4.types.Cpu
import org.ovirt.engine.sdk4.types.CpuPinningPolicy
import org.ovirt.engine.sdk4.types.DataCenterStatus
import org.ovirt.engine.sdk4.types.Display
import org.ovirt.engine.sdk4.types.DisplayType
import org.ovirt.engine.sdk4.types.FipsMode
import org.ovirt.engine.sdk4.types.FirewallType
import org.ovirt.engine.sdk4.types.InheritableBoolean
import org.ovirt.engine.sdk4.types.LogSeverity
import org.ovirt.engine.sdk4.types.MigrateOnError
import org.ovirt.engine.sdk4.types.Template
import org.ovirt.engine.sdk4.types.MigrationOptions
import org.ovirt.engine.sdk4.types.OperatingSystem
import org.ovirt.engine.sdk4.types.OperatingSystemInfo
import org.ovirt.engine.sdk4.types.OsType
import org.ovirt.engine.sdk4.types.QuotaModeType
import org.ovirt.engine.sdk4.types.StorageDomainStatus
import org.ovirt.engine.sdk4.types.StorageDomainType
import org.ovirt.engine.sdk4.types.StorageType
import org.ovirt.engine.sdk4.types.Vm
import org.ovirt.engine.sdk4.types.VmAffinity
import org.ovirt.engine.sdk4.types.VmPlacementPolicy
import org.ovirt.engine.sdk4.types.VmStatus
import org.ovirt.engine.sdk4.types.TemplateStatus
import org.ovirt.engine.sdk4.types.VmStorageErrorResumeBehaviour
import org.ovirt.engine.sdk4.types.VmType

fun DataCenterStatus?.toStoragePoolStatus(): StoragePoolStatus =
	StoragePoolStatus.forCode(this@toStoragePoolStatus?.value())

fun StoragePoolStatus?.toDataCenterStatus(): DataCenterStatus =
	DataCenterStatus.fromValue(this@toDataCenterStatus?.code)

fun LogSeverity?.toAuditLogSeverity(): AuditLogSeverity =
	AuditLogSeverity.forCode(this@toAuditLogSeverity?.value())

fun VmStatus?.toVmStatusB(): VmStatusB =
	VmStatusB.forCode(this@toVmStatusB?.value())

fun Vm.findStatus(): VmStatusB =
	this@findStatus.status().toVmStatusB()

fun VmTemplateStatusB.toTemplateStatus(): TemplateStatus =
	TemplateStatus.fromValue(this@toTemplateStatus.code)

fun TemplateStatus?.toVmTemplateStatusB(): VmTemplateStatusB =
	VmTemplateStatusB.forCode(this@toVmTemplateStatusB?.value())

fun Template.findTemplateStatus(): VmTemplateStatusB =
	this@findTemplateStatus.status().toVmTemplateStatusB()

fun VmType?.toVmTypeB(): VmTypeB? =
	VmTypeB.forCode(this@toVmTypeB?.value())

fun BootSequence.toBootDevices(): List<BootDevice> = when(this@toBootDevices) {
	BootSequence.C -> listOf(BootDevice.HD)
	BootSequence.D -> listOf(BootDevice.CDROM)
	BootSequence.N -> listOf(BootDevice.NETWORK)
	BootSequence.DC -> listOf(BootDevice.CDROM, BootDevice.HD)
	BootSequence.CDN -> listOf(BootDevice.HD, BootDevice.CDROM, BootDevice.NETWORK)
	BootSequence.CND -> listOf(BootDevice.HD, BootDevice.NETWORK, BootDevice.CDROM)
	BootSequence.DCN -> listOf(BootDevice.CDROM, BootDevice.HD, BootDevice.NETWORK)
	BootSequence.DNC -> listOf(BootDevice.CDROM, BootDevice.NETWORK, BootDevice.HD)
	BootSequence.NCD -> listOf(BootDevice.NETWORK, BootDevice.HD, BootDevice.CDROM)
	BootSequence.NDC -> listOf(BootDevice.NETWORK, BootDevice.CDROM, BootDevice.HD)
	BootSequence.CD -> listOf(BootDevice.HD, BootDevice.CDROM)
	BootSequence.CN -> listOf(BootDevice.HD, BootDevice.NETWORK)
	BootSequence.DN -> listOf(BootDevice.CDROM, BootDevice.NETWORK)
	BootSequence.NC -> listOf(BootDevice.NETWORK, BootDevice.HD)
	BootSequence.ND -> listOf(BootDevice.NETWORK, BootDevice.CDROM)
}

fun List<BootDevice>.toBootSequence(): BootSequence = when {
	this@toBootSequence.deepEquals(listOf(BootDevice.CDROM)) -> BootSequence.D
	this@toBootSequence.deepEquals(listOf(BootDevice.NETWORK)) -> BootSequence.N
	this@toBootSequence.deepEquals(listOf(BootDevice.CDROM, BootDevice.HD)) -> BootSequence.DC
	this@toBootSequence.deepEquals(listOf(BootDevice.HD, BootDevice.CDROM, BootDevice.NETWORK)) -> BootSequence.CDN
	this@toBootSequence.deepEquals(listOf(BootDevice.HD, BootDevice.NETWORK, BootDevice.CDROM)) -> BootSequence.CND
	this@toBootSequence.deepEquals(listOf(BootDevice.CDROM, BootDevice.HD, BootDevice.NETWORK)) -> BootSequence.DCN
	this@toBootSequence.deepEquals(listOf(BootDevice.CDROM, BootDevice.NETWORK, BootDevice.HD)) -> BootSequence.DNC
	this@toBootSequence.deepEquals(listOf(BootDevice.NETWORK, BootDevice.HD, BootDevice.CDROM)) -> BootSequence.NCD
	this@toBootSequence.deepEquals(listOf(BootDevice.NETWORK, BootDevice.CDROM, BootDevice.HD)) -> BootSequence.NDC
	this@toBootSequence.deepEquals(listOf(BootDevice.HD, BootDevice.CDROM)) -> BootSequence.CD
	this@toBootSequence.deepEquals(listOf(BootDevice.HD, BootDevice.NETWORK)) -> BootSequence.CN
	this@toBootSequence.deepEquals(listOf(BootDevice.CDROM, BootDevice.NETWORK)) -> BootSequence.DN
	this@toBootSequence.deepEquals(listOf(BootDevice.NETWORK, BootDevice.HD)) -> BootSequence.NC
	this@toBootSequence.deepEquals(listOf(BootDevice.NETWORK, BootDevice.CDROM)) -> BootSequence.ND
	this@toBootSequence.deepEquals(listOf(BootDevice.HD)) -> BootSequence.C
	else -> BootSequence.C
}

fun VmTypeB?.toVmType(): VmType? =
	VmType.fromValue(this@toVmType?.name)

fun BiosType?.toBiosTypeB(): BiosTypeB =
	BiosTypeB.forCode(this@toBiosTypeB?.value())

fun BiosTypeB?.toBiosType(): BiosType? =
	BiosType.fromValue(this@toBiosType?.name?.lowercase())

fun Bios?.findBiosTypeB(): BiosTypeB =
	BiosTypeB.forCode(this@findBiosTypeB?.type()?.value())

fun Bios?.findBiosType(): BiosType =
	BiosType.fromValue(this@findBiosType?.type()?.value())

fun OsType?.toVmOsType(): VmOsType =
	VmOsType.forCode(this@toVmOsType?.value())

fun VmOsType?.toOsType(): OsType = when(this@toOsType) {
	else -> OsType.fromValue(this@toOsType?.code ?: VmOsType.other.code)
}

fun VmOsType?.toOsTypeCode(): String = when(this@toOsTypeCode) {
	// NOTE: SDK OsType 에서 없는 것들은 강제로 주입
	VmOsType.rhel_7x64,
	VmOsType.rhel_8x64,
	VmOsType.rhel_9x64,
	VmOsType.rhel_core_os,
	VmOsType.red_hat_atomic_7x64,
	VmOsType.other_linux_kernel_4,
	VmOsType.windows_10,
	VmOsType.windows_10x64,
	VmOsType.windows_11,
	VmOsType.windows_2008r2x64,
	VmOsType.windows_2012,
	VmOsType.windows_2012r2x64,
	VmOsType.sles_11,
	VmOsType.ubuntu_12_04,
	VmOsType.ubuntu_12_10,
	VmOsType.ubuntu_13_04,
	VmOsType.ubuntu_13_10,
	VmOsType.ubuntu_14_04,
	VmOsType.ubuntu_18_04,
	VmOsType.debian_7,
	VmOsType.debian_9,
	VmOsType.freebsd,
	VmOsType.freebsdx64 -> this@toOsTypeCode.name
	else -> OsType.fromValue(this@toOsTypeCode?.code ?: VmOsType.other.code).value()
}

fun OperatingSystem.findVmOsType(): VmOsType =
	VmOsType.forCode(this@findVmOsType.type())

fun OperatingSystem.findOsType(): OsType =
	OsType.fromValue(this@findOsType.type())

fun Architecture?.toArchitectureType(): ArchitectureType? =
	ArchitectureType.forCode(this@toArchitectureType?.value())

fun ArchitectureType?.toArchitecture(): Architecture? =
	Architecture.fromValue(this@toArchitecture?.name?.lowercase())

fun Cpu?.findArchitectureType(): ArchitectureType? =
	this@findArchitectureType?.architecture()?.toArchitectureType()

fun CpuPinningPolicy?.toCpuPinningPolicyB(): CpuPinningPolicyB? =
	CpuPinningPolicyB.forCode(this@toCpuPinningPolicyB?.name?.lowercase())

fun CpuPinningPolicyB?.toCpuPinningPolicy(): CpuPinningPolicy? =
	CpuPinningPolicy.fromValue(this@toCpuPinningPolicy?.name?.lowercase())

fun DisplayType?.toGraphicsTypeB(): GraphicsTypeB? =
	GraphicsTypeB.forCode(this@toGraphicsTypeB?.value())

fun Display?.findGraphicsTypeB(): GraphicsTypeB? =
	this@findGraphicsTypeB?.type().toGraphicsTypeB()

fun FipsMode.toFipsModeB(): FipsModeB =
	FipsModeB.forCode(this@toFipsModeB.value())

fun FipsModeB.toFipsMode(): FipsMode =
	FipsMode.fromValue(this@toFipsMode.code)

fun FirewallType.toFirewallTypeB(): FirewallTypeB =
	FirewallTypeB.forCode(this@toFirewallTypeB.value())

fun FirewallTypeB.toFirewallType(): FirewallType =
	FirewallType.fromValue(this@toFirewallType.code)

fun VmAffinity?.toMigrationSupport(): MigrationSupport =
	MigrationSupport.forCode(this@toMigrationSupport?.value())

fun VmPlacementPolicy.findMigrationSupport(): MigrationSupport =
	this@findMigrationSupport.affinity().toMigrationSupport()

fun MigrationOptions.findMigrationEncrypt(): Boolean? =
	this@findMigrationEncrypt.encrypted().toBoolean()

fun MigrationOptions.findMigrationAutoConverge(): Boolean? =
	this@findMigrationAutoConverge.autoConverge().toBoolean()

fun MigrationOptions.findMigrationCompression(): Boolean? =
	this@findMigrationCompression.compressed().toBoolean()

fun MigrationSupport.toVmAffinity(): VmAffinity =
	VmAffinity.fromValue(this@toVmAffinity.code)

fun MigrateOnError.toMigrateOnErrorB(): MigrateOnErrorB =
	MigrateOnErrorB.forCode(this@toMigrateOnErrorB.value())

fun MigrateOnErrorB.toMigrateOnError(): MigrateOnError =
	MigrateOnError.fromValue(this@toMigrateOnError.code)

fun OperatingSystemInfo.toVmOsType(): VmOsType =
	VmOsType.forCode(this@toVmOsType.id())

fun List<OperatingSystemInfo>.toVmOsTypes(): List<VmOsType> =
	this@toVmOsTypes.map { it.toVmOsType() }

fun StorageDomainStatus?.toStorageDomainStatusB(): StorageDomainStatusB =
	StorageDomainStatusB.forCode(this@toStorageDomainStatusB?.value())

fun StorageDomainStatusB?.toStorageDomainStatus(): StorageDomainStatus =
	StorageDomainStatus.fromValue(this@toStorageDomainStatus?.code)

fun StorageDomainType.toStorageDomainTypeB(): StorageDomainTypeB =
	StorageDomainTypeB.forCode(this@toStorageDomainTypeB.value())

fun StorageDomainTypeB.toStorageDomainType(): StorageDomainType =
	StorageDomainType.fromValue(this@toStorageDomainType.code)

fun StorageType.toStorageTypeB(): StorageTypeB =
	StorageTypeB.forCode(this@toStorageTypeB.value())

fun StorageTypeB.toStorageType(): StorageType =
	StorageType.fromValue(this@toStorageType.code)

fun QuotaEnforcementType.toQuotaModeType(): QuotaModeType =
	QuotaModeType.fromValue(this@toQuotaModeType.name)

fun QuotaModeType.toQuotaEnforcementType(): QuotaEnforcementType =
	QuotaEnforcementType.forCode(this@toQuotaEnforcementType.value())

fun VmStorageErrorResumeBehaviour.toVmResumeBehavior(): VmResumeBehavior =
	VmResumeBehavior.forCode(this@toVmResumeBehavior.name)

fun VmResumeBehavior.toVmStorageErrorResumeBehavior(): VmStorageErrorResumeBehaviour =
	VmStorageErrorResumeBehaviour.fromValue(this@toVmStorageErrorResumeBehavior.name.lowercase())

fun InheritableBoolean.toBoolean(): Boolean? = when(this@toBoolean.name) {
	"true" -> true
	"false" -> false
	else -> null
}
