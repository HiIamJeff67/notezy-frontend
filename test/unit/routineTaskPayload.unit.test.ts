import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { RoutineTaskPayloadSchema } from "@shared/api/interfaces/routineTaskPayload.interface";

const block = {
  id: "73b3a848-bca0-44e4-8fb4-cf6cc6ca6aee",
  type: "paragraph",
  props: {},
  content: [],
  children: [],
};

describe("RoutineTaskPayloadSchema", () => {
  test("requires wrapped CreateBlockPack template blocks", () => {
    const payload = {
      targetSubShelfId: "09311e30-6adc-4979-84e1-2912dd200fa4",
      template: {
        name: "Routine block pack",
        blocks: [
          {
            clientId: block.id,
            prevClientId: null,
            arborizedEditableBlock: block,
          },
        ],
      },
    };

    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateBlockPack,
        payload,
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateBlockPack,
        payload: {
          ...payload,
          template: { ...payload.template, blocks: [block] },
        },
      }).success
    ).toBe(false);
  });
});
