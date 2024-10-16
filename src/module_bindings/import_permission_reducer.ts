// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class ImportPermissionReducer extends Reducer
{
	public static reducerName: string = "ImportPermission";
	public static call(_identity: Identity, _permissionLevel: string) {
		this.getReducer().call(_identity, _permissionLevel);
	}

	public call(_identity: Identity, _permissionLevel: string) {
		const serializer = this.client.getSerializer();
		let _identityType = AlgebraicType.createProductType([
			new ProductTypeElement("__identity_bytes", AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8))),
		]);
		serializer.write(_identityType, _identity);
		let _permissionLevelType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_permissionLevelType, _permissionLevel);
		this.client.call("ImportPermission", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let identityType = AlgebraicType.createProductType([
			new ProductTypeElement("__identity_bytes", AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8))),
		]);
		let identityValue = AlgebraicValue.deserialize(identityType, adapter.next())
		let identity = new Identity(identityValue.asProductValue().elements[0].asBytes());
		let permissionLevelType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let permissionLevelValue = AlgebraicValue.deserialize(permissionLevelType, adapter.next())
		let permissionLevel = permissionLevelValue.asString();
		return [identity, permissionLevel];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _identity: Identity, _permissionLevel: string) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _identity: Identity, _permissionLevel: string) => void)
	{
		this.client.on("reducer:ImportPermission", callback);
	}
}


export default ImportPermissionReducer
