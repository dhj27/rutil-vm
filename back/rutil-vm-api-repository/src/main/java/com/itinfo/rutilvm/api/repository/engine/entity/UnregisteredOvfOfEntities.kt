package com.itinfo.rutilvm.api.repository.engine.entity

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.dataformat.xml.ser.ToXmlGenerator
import com.fasterxml.jackson.module.kotlin.KotlinFeature
import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.itinfo.rutilvm.common.LoggerDelegate
import org.hibernate.annotations.Type
import java.util.UUID
import java.io.Serializable
import javax.persistence.CascadeType
// Or jakarta.persistence.* for newer Spring Boot
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Lob
import javax.persistence.OneToMany
import javax.persistence.Table

@Embeddable
data class UnregisteredOvfEntityId(
	@Column(name = "entity_guid", nullable = false)
	var entityGuid: UUID? = null,

	@Column(name = "storage_domain_id", nullable = false)
	var storageDomainId: UUID? = null, // Default for construction, should be set
) : Serializable

@Entity
@Table(name = "unregistered_ovf_of_entities")
data class UnregisteredOvfOfEntities(
	@EmbeddedId
	var id: UnregisteredOvfEntityId? = null,
	val entityName: String,
	val entityType: String, // VM 또는 TEMPLATE
	val architecture: Int? = null, // Map to ArchitectureType enum
	val lowestCompVersion: String? = null,

	@Lob
	@Type(type="org.hibernate.type.TextType")
	@Column(name = "ovf_data", columnDefinition = "TEXT")
	val ovfData: String? = null,

	@Lob
	@Type(type="org.hibernate.type.TextType")
	@Column(name = "ovf_extra_data", columnDefinition = "TEXT")
	val ovfExtraData: String? = null,

	@Column(name = "status")
	val status: Int? = null, // Map to UnregisteredEntityStatus enum

	// DDL doesn't have _create_date or _update_date for this table.
	// If you need them for auditing, add them to DDL and then here.

	// If you have a StorageDomainStatic entity and want to map the relationship:
	// @ManyToOne(fetch = FetchType.LAZY)
	// @JoinColumn(name = "storage_domain_id", referencedColumnName = "id", insertable = false, updatable = false)
	// val storageDomain: StorageDomainStatic? = null,

	@OneToMany(
		mappedBy="unregisteredOvfOfEntities",
		cascade=[CascadeType.ALL],
		orphanRemoval=true,
		fetch=FetchType.LAZY
	)
	val diskToVmEntries: MutableSet<UnregisteredDiskToVmEntity> = mutableSetOf()

) : Serializable {
	val ovf: OvfEnvelope?
		get() = try {
			xmlMapper.readValue(ovfData, OvfEnvelope::class.java)
		} catch (e: Exception) {
			e.printStackTrace()
			log.error("Error parsing ovf XML data for {}", id?.entityGuid)
			null
		}

	val disksFromOvf: List<OvfDisk>
		get() = try {
			ovf?.diskSection?.disks ?: listOf()
		} catch (e: Exception) {
			e.printStackTrace()
			log.error("Error retrieving ovf disks for {}", id?.entityGuid)
			listOf()
		}

	override fun equals(other: Any?): Boolean {
		if (this === other) return true
		if (javaClass != other?.javaClass) return false
		other as UnregisteredDiskToVmEntity
		return id == other.id
	}

	override fun hashCode(): Int = id.hashCode()

	class Builder {
		private var bId: UnregisteredOvfEntityId = UnregisteredOvfEntityId(); fun id(block: () -> UnregisteredOvfEntityId?) { bId = block() ?: UnregisteredOvfEntityId() }
		fun entityGuid(block: () -> UUID?) { bId.entityGuid = block() ?: UUID.randomUUID() }
		fun storageDomainIdForId(block: () -> UUID?) { bId.storageDomainId = block() ?: UUID.randomUUID() }
		private lateinit var bName: String; fun name(block: () -> String) { bName = block() }
		private lateinit var bEntityType: String; fun entityType(block: () -> String) { bEntityType = block() }
		private var bArchitecture: Int? = null; fun architecture(block: () -> Int?) { bArchitecture = block() }
		private var bLowestCompVersion: String? = null; fun lowestCompVersion(block: () -> String?) { bLowestCompVersion = block() }
		private var bOvfData: String? = null; fun ovfData(block: () -> String?) { bOvfData = block() }
		private var bOvfExtraData: String? = null; fun ovfExtraData(block: () -> String?) { bOvfExtraData = block() }
		private var bStatus: Int? = null; fun status(block: () -> Int?) { bStatus = block() }
		private var bDiskToVmEntries: MutableSet<UnregisteredDiskToVmEntity> = mutableSetOf(); fun diskToVmEntries(block: () -> MutableSet<UnregisteredDiskToVmEntity>?) { bDiskToVmEntries = block() ?: mutableSetOf() }

		fun build(): UnregisteredOvfOfEntities {
			if (!this::bName.isInitialized) throw IllegalStateException("name is required")
			if (!this::bEntityType.isInitialized) throw IllegalStateException("entityType is required")
			if (bId.entityGuid == UUID(0,0) || bId.storageDomainId == UUID(0,0)) {
				// Consider more robust validation or ensure defaults are meaningful
			}
			return UnregisteredOvfOfEntities(
				bId, bName, bEntityType, bArchitecture, bLowestCompVersion,
				bOvfData, bOvfExtraData, bStatus, bDiskToVmEntries
			)
		}
	}

	companion object {
		private val log by LoggerDelegate()
		val xmlMapper: ObjectMapper = XmlMapper.builder()
			.defaultUseWrapper(false)
			.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES) // 여기에 설정
			.build()
			.registerModules(
				kotlinModule {
					configure(KotlinFeature.NullIsSameAsDefault, true)
					configure(KotlinFeature.NullToEmptyCollection, true)
				},
				SimpleModule().apply {
					addDeserializer(OvfVirtualHardwareSection::class.java, OvfVirtualHardwareSectionDeserializer())
					// addDeserializer(RasdItem::class.java, RasdItemDeserializer())
				}
			)
			.enable(
				DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT,
				DeserializationFeature.USE_JAVA_ARRAY_FOR_JSON_ARRAY,
				DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY
			)
			.disable(
				DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
				DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES
			)


		// .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
		inline fun builder(block: Builder.() -> Unit): UnregisteredOvfOfEntities = Builder().apply(block).build()
	}
}


