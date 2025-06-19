package com.itinfo.rutilvm.util.ovirt

import com.itinfo.rutilvm.api.ovirt.business.model.Term
import com.itinfo.rutilvm.api.ovirt.business.model.logSuccess
import com.itinfo.rutilvm.api.ovirt.business.model.logSuccessWithin
import com.itinfo.rutilvm.api.ovirt.business.model.logFail
import com.itinfo.rutilvm.api.ovirt.business.model.logFailWithin

import com.itinfo.rutilvm.util.ovirt.error.*

import org.ovirt.engine.sdk4.Error
import org.ovirt.engine.sdk4.Connection
import org.ovirt.engine.sdk4.services.VnicProfileService
import org.ovirt.engine.sdk4.services.VnicProfilesService
import org.ovirt.engine.sdk4.types.VnicProfile

private fun Connection.srvVnicProfiles(): VnicProfilesService =
	this.systemService.vnicProfilesService()

fun Connection.findAllVnicProfiles(follow: String = ""): Result<List<VnicProfile>> = runCatching {
	this.srvVnicProfiles().list().apply {
		if(follow.isNotEmpty()) follow(follow)
	}.send().profiles()

}.onSuccess {
	Term.VNIC_PROFILE.logSuccess("목록조회")
}.onFailure {
	Term.VNIC_PROFILE.logFail("목록조회", it)
	throw if (it is Error) it.toItCloudException() else it
}

private fun Connection.srvVnicProfile(vnicProfileId: String): VnicProfileService =
	this.srvVnicProfiles().profileService(vnicProfileId)

fun Connection.findVnicProfile(vnicProfileId: String, follow: String = ""): Result<VnicProfile?> = runCatching {
	this.srvVnicProfile(vnicProfileId).get().apply {
		if(follow.isNotEmpty()) follow(follow)
	}.send().profile()

}.onSuccess {
	Term.VNIC_PROFILE.logSuccess("상세조회", vnicProfileId)
}.onFailure {
	Term.VNIC_PROFILE.logFail("상세조회", it, vnicProfileId)
	throw if (it is Error) it.toItCloudException() else it
}

fun List<VnicProfile>.nameDuplicateVnicProfileName(vnicProfileName: String, vnicProfileId: String? = null): Boolean =
	this.filter { it.id() != vnicProfileId }.any { it.name() == vnicProfileName }

fun Connection.addVnicProfileFromNetwork(networkId: String, vnicProfile: VnicProfile): Result<VnicProfile?> = runCatching {
	checkNetworkExists(networkId)

	if (this.findAllVnicProfiles().getOrDefault(listOf())
			.nameDuplicateVnicProfileName(vnicProfile.name())) {
		throw ErrorPattern.VNIC_PROFILE_DUPLICATE.toError()
	}
	this.srvVnicProfilesFromNetwork(networkId).add().profile(vnicProfile).send().profile()

}.onSuccess {
	Term.VNIC_PROFILE.logSuccess("생성")
}.onFailure {
	Term.VNIC_PROFILE.logFail("생성", it)
	throw if (it is Error) it.toItCloudException() else it
}

fun Connection.updateVnicProfile(vnicProfile: VnicProfile): Result<VnicProfile?> = runCatching {
	if (this.findAllVnicProfiles().getOrDefault(listOf())
			.nameDuplicateVnicProfileName(vnicProfile.name(), vnicProfile.id())) {
		throw ErrorPattern.VNIC_PROFILE_DUPLICATE.toError()
	}

	this.srvVnicProfile(vnicProfile.id()).update().profile(vnicProfile).send().profile()

}.onSuccess {
	Term.VNIC_PROFILE.logSuccess("편집", vnicProfile.id())
}.onFailure {
	Term.VNIC_PROFILE.logFail("편집", it, vnicProfile.id())
	throw if (it is Error) it.toItCloudException() else it
}

fun Connection.removeVnicProfile(vnicProfileId: String): Result<Boolean> = runCatching {
	this.srvVnicProfile(vnicProfileId).remove().send()
	true

}.onSuccess {
	Term.VNIC_PROFILE.logSuccess("삭제", vnicProfileId)
}.onFailure {
	Term.VNIC_PROFILE.logFail("삭제", it, vnicProfileId)
	throw if (it is Error) it.toItCloudException() else it
}
