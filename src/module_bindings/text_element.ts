// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, DatabaseTable, AlgebraicValue, ReducerEvent, Identity, Address, ClientDB, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class TextElement extends DatabaseTable
{
	public static db: ClientDB = __SPACETIMEDB__.clientDB;
	public static tableName = "TextElement";
	public text: string;
	public size: number;
	public color: string;
	public font: string;
	public css: string;

	public static primaryKey: string | undefined = undefined;

	constructor(text: string, size: number, color: string, font: string, css: string) {
	super();
		this.text = text;
		this.size = size;
		this.color = color;
		this.font = font;
		this.css = css;
	}

	public static serialize(value: TextElement): object {
		return [
		value.text, value.size, value.color, value.font, value.css
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("text", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("size", AlgebraicType.createPrimitiveType(BuiltinType.Type.I32)),
			new ProductTypeElement("color", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("font", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new ProductTypeElement("css", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
		]);
	}

	public static fromValue(value: AlgebraicValue): TextElement
	{
		let productValue = value.asProductValue();
		let __Text = productValue.elements[0].asString();
		let __Size = productValue.elements[1].asNumber();
		let __Color = productValue.elements[2].asString();
		let __Font = productValue.elements[3].asString();
		let __Css = productValue.elements[4].asString();
		return new this(__Text, __Size, __Color, __Font, __Css);
	}

}

export default TextElement;
