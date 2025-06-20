package com.itinfo.rutilvm.api.repository.engine

import com.fasterxml.jackson.databind.ObjectMapper
import com.itinfo.rutilvm.api.repository.engine.entity.OvfEnvelope
import com.itinfo.rutilvm.api.repository.engine.entity.UnregisteredOvfOfEntities
import com.itinfo.rutilvm.common.LoggerDelegate
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import java.io.FileNotFoundException
import java.io.InputStream

class OvfEnvelopDeserializationTest {

	private lateinit var xmlMapper: ObjectMapper
	private lateinit var ovfXmlContent: String

	@BeforeEach
	fun setup() {
		log.info("setup ...")
		xmlMapper = UnregisteredOvfOfEntities.xmlMapper

		val inputStream: InputStream = Thread.currentThread().contextClassLoader.getResourceAsStream(OVFDATA_TEST_FILENAME) ?: throw FileNotFoundException(
			"Cannot find OVF sample file: $OVFDATA_TEST_FILENAME in resources. " +
				"Ensure it's in src/test/resources and the path is correct."
		)
		ovfXmlContent = inputStream.bufferedReader().use { it.readText() }
	}

	@Test
	fun `should parse OVF Envelope correctly from file`() {
		assertDoesNotThrow("Parsing OVF from file should not throw an exception") {
			log.info("Attempting to parse OVF XML from file: $OVFDATA_TEST_FILENAME")
			val envelope = xmlMapper.readValue(ovfXmlContent, OvfEnvelope::class.java)
			log.info("OVF XML from file parsed successfully")

			assertNotNull(envelope, "Envelope should not be null")
			assertNotNull(envelope.virtualSystem, "VirtualSystem (Content) should not be null")

			val content = envelope.virtualSystem!!
			assertEquals("test-20250414", content.name, "VM Name mismatch")

			// Check References
			assertNotNull(envelope.references?.files)
			assertEquals(8, envelope.references?.files?.size, "Should be 8 files in References")

			// Check DiskSection (top level)
			assertNotNull(envelope.diskSection?.disks)
			assertEquals(8, envelope.diskSection?.disks?.size, "Should be 8 disks in top-level DiskSection")
			// Make sure the <Disk> elements in DiskSection are correctly namespaced
			// Example assertion for the first disk in DiskSection:
			val firstDiskInSection = envelope.diskSection?.disks?.firstOrNull()
			assertNotNull(firstDiskInSection, "First disk in DiskSection should exist")
			assertEquals("d00a5b23-c8d5-4f85-af8f-017483a83cb1", firstDiskInSection?.diskId)


			// Check Content Sections (polymorphic)
			assertNotNull(content.sections, "Content sections list should not be null")
			assertFalse(content.sections.isNullOrEmpty(), "Content sections list should not be empty")
			// assertEquals(3, content.sections?.size, "Should be 3 sections in Content (OS, HW, Snapshots)")

			val osSection = content.operatingSystemSection
			assertNotNull(osSection, "OperatingSystemSection should be present")
			assertEquals("other", osSection?.description)
			// assertEquals("ecf7826f-957f-43e0-bd6e-d8cb23729198", osSection?.ovfId) // Check common base property

			val hardwareSection = content.virtualHardwareSection
			assertNotNull(hardwareSection, "VirtualHardwareSection should be present")
			assertEquals("8 CPU, 4096 Memory", hardwareSection?.info)
			assertNotNull(hardwareSection?.system)
			assertEquals("ENGINE 4.4.0.0", hardwareSection?.system?.virtualSystemType)

			println("items: ${hardwareSection?.items?.size}")
			hardwareSection?.items?.forEach {
				println("item caption: ${it.caption}")
				println("item itemType: ${it.itemType}")
				println("item InstanceId: ${it.instanceId}")
				println("item description: ${it.description}")
				println("item resourceType: ${it.resourceType}")

			}

			// assertNotNull(hardwareSection?.items, "Hardware items list should not be null")
			// assertFalse(hardwareSection?.items.isNullOrEmpty(), "Hardware items list should not be empty")
			//
			// val firstItem = hardwareSection?.items?.firstOrNull()
			// assertNotNull(firstItem, "First hardware item should exist")
			// assertEquals("8 virtual cpu", firstItem?.caption, "First item (CPU) caption mismatch")
			// assertEquals(3, firstItem?.resourceType, "First item (CPU) resource type mismatch")

			/*
			val snapshotsSection = content.snapshotsSection
			assertNotNull(snapshotsSection, "SnapshotsSection should be present")
			assertNotNull(snapshotsSection?.snapshots)
			assertFalse(snapshotsSection?.snapshots.isNullOrEmpty(), "Snapshots list should not be empty")
			val activeSnapshot = snapshotsSection?.snapshots?.find { it.type == "ACTIVE" }
			assertNotNull(activeSnapshot, "Active snapshot should exist")
			assertEquals("18f0255e-7dea-4e74-b85f-23cc6688f27a", activeSnapshot?.id)
			*/
			log.info("Basic OVF structure from file seems correct.")
		}
	}

	companion object {
		private val log by LoggerDelegate()
		private const val OVFDATA_TEST_FILENAME = "./ovfdata-ecf7826f-957f-43e0-bd6e-d8cb23729198.xml"
	}
}
