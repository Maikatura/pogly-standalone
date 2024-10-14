// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class ImportConfigReducer extends Reducer
{
	public static reducerName: string = "ImportConfig";
	public static call(_platform: string, _channel: string, _ownerIdentity: Identity, _debug: boolean, _updateHz: number, _editorBorder: number, _authentication: boolean, _strictMode: boolean, _zmin: number, _zmax: number, _authKey: string) {
		this.getReducer().call(_platform, _channel, _ownerIdentity, _debug, _updateHz, _editorBorder, _authentication, _strictMode, _zmin, _zmax, _authKey);
	}

	public call(_platform: string, _channel: string, _ownerIdentity: Identity, _debug: boolean, _updateHz: number, _editorBorder: number, _authentication: boolean, _strictMode: boolean, _zmin: number, _zmax: number, _authKey: string) {
		const serializer = this.client.getSerializer();
		let _platformType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_platformType, _platform);
		let _channelType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_channelType, _channel);
		let _ownerIdentityType = AlgebraicType.createProductType([
			new ProductTypeElement("__identity_bytes", AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8))),
		]);
		serializer.write(_ownerIdentityType, _ownerIdentity);
		let _debugType = AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool);
		serializer.write(_debugType, _debug);
		let _updateHzType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_updateHzType, _updateHz);
		let _editorBorderType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_editorBorderType, _editorBorder);
		let _authenticationType = AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool);
		serializer.write(_authenticationType, _authentication);
		let _strictModeType = AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool);
		serializer.write(_strictModeType, _strictMode);
		let _zminType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_zminType, _zmin);
		let _zmaxType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_zmaxType, _zmax);
		let _authKeyType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_authKeyType, _authKey);
		this.client.call("ImportConfig", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let platformType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let platformValue = AlgebraicValue.deserialize(platformType, adapter.next())
		let platform = platformValue.asString();
		let channelType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let channelValue = AlgebraicValue.deserialize(channelType, adapter.next())
		let channel = channelValue.asString();
		let ownerIdentityType = AlgebraicType.createProductType([
			new ProductTypeElement("__identity_bytes", AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8))),
		]);
		let ownerIdentityValue = AlgebraicValue.deserialize(ownerIdentityType, adapter.next())
		let ownerIdentity = new Identity(ownerIdentityValue.asProductValue().elements[0].asBytes());
		let debugType = AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool);
		let debugValue = AlgebraicValue.deserialize(debugType, adapter.next())
		let debug = debugValue.asBoolean();
		let updateHzType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let updateHzValue = AlgebraicValue.deserialize(updateHzType, adapter.next())
		let updateHz = updateHzValue.asNumber();
		let editorBorderType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let editorBorderValue = AlgebraicValue.deserialize(editorBorderType, adapter.next())
		let editorBorder = editorBorderValue.asNumber();
		let authenticationType = AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool);
		let authenticationValue = AlgebraicValue.deserialize(authenticationType, adapter.next())
		let authentication = authenticationValue.asBoolean();
		let strictModeType = AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool);
		let strictModeValue = AlgebraicValue.deserialize(strictModeType, adapter.next())
		let strictMode = strictModeValue.asBoolean();
		let zminType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let zminValue = AlgebraicValue.deserialize(zminType, adapter.next())
		let zmin = zminValue.asNumber();
		let zmaxType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let zmaxValue = AlgebraicValue.deserialize(zmaxType, adapter.next())
		let zmax = zmaxValue.asNumber();
		let authKeyType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let authKeyValue = AlgebraicValue.deserialize(authKeyType, adapter.next())
		let authKey = authKeyValue.asString();
		return [platform, channel, ownerIdentity, debug, updateHz, editorBorder, authentication, strictMode, zmin, zmax, authKey];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _platform: string, _channel: string, _ownerIdentity: Identity, _debug: boolean, _updateHz: number, _editorBorder: number, _authentication: boolean, _strictMode: boolean, _zmin: number, _zmax: number, _authKey: string) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _platform: string, _channel: string, _ownerIdentity: Identity, _debug: boolean, _updateHz: number, _editorBorder: number, _authentication: boolean, _strictMode: boolean, _zmin: number, _zmax: number, _authKey: string) => void)
	{
		this.client.on("reducer:ImportConfig", callback);
	}
}


export default ImportConfigReducer
