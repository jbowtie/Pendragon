const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  ForeignDocumentField,
  ArrayField,
  BooleanField,
} = foundry.data.fields;

export class PartyData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      members: new ArrayField(
        new ForeignDocumentField(foundry.documents.BaseActor),
      ),
    };
  }
}
