// import { Client } from "@fuels/streams";
// import { beforeEach, describe, expect, it, vi } from "vitest";
// import { createActor, waitFor } from "xstate";
// import { streamMachine } from "../stream/use-stream-data";

// // Mock the Client class and other dependencies
// vi.mock("@fuels/streams", () => {
//   return {
//     Client: {
//       connect: vi.fn(),
//       getInstance: vi.fn(),
//       switchNetwork: vi.fn(),
//     },
//     BlocksStream: {
//       init: vi.fn().mockImplementation(() =>
//         Promise.resolve({
//           subscribeWithString: vi.fn().mockImplementation(() =>
//             Promise.resolve({
//               stop: vi.fn(),
//               [Symbol.asyncIterator]: () => ({
//                 next: vi.fn().mockResolvedValue({
//                   value: {
//                     json: () => ({
//                       subject: "test",
//                       payload: {},
//                       timestamp: "2024-01-01",
//                     }),
//                   },
//                   done: true,
//                 }),
//               }),
//             }),
//           ),
//         }),
//       ),
//     },
//   };
// });

// // Mock toast notifications
// vi.mock("sonner", () => ({
//   toast: {
//     success: vi.fn(),
//     error: vi.fn(),
//   },
// }));

// describe("Stream Data Machine", () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//     (Client.getInstance as any).mockReturnValue({
//       switchNetwork: vi.fn().mockResolvedValue({}),
//     });
//   });

//   it("should start in connecting state", () => {
//     const actor = createActor(streamMachine).start();
//     expect(actor.getSnapshot().value).toBe("connecting");
//   });

//   it("should transition to idle state after successful connection", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));
//     expect(actor.getSnapshot().value).toBe("idle");
//   });

//   it("should handle START event correctly", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));

//     actor.send({
//       type: "START",
//       subject: "test-subject",
//       selectedModule: "blocks",
//     });

//     await waitFor(actor, (state) => state.matches("subscribing"));
//     const snapshot = actor.getSnapshot();
//     expect(snapshot.value).toBe("subscribing");
//     expect(snapshot.context.subject).toBe("test-subject");
//     expect(snapshot.context.selectedModule).toBe("blocks");
//   });

//   it("should handle STOP event correctly", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));

//     actor.send({
//       type: "START",
//       subject: "test-subject",
//       selectedModule: "blocks",
//     });

//     await waitFor(actor, (state) => state.matches("subscribing"));

//     actor.send({ type: "STOP" });
//     await waitFor(actor, (state) => state.matches("idle"));

//     const snapshot = actor.getSnapshot();
//     expect(snapshot.value).toBe("idle");
//     expect(snapshot.context.subject).toBe(null);
//     expect(snapshot.context.selectedModule).toBe(null);
//   });

//   it("should handle CLEAR event correctly", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));

//     actor.send({
//       type: "START",
//       subject: "test-subject",
//       selectedModule: "blocks",
//     });

//     await waitFor(actor, (state) => state.matches("subscribing"));

//     actor.send({
//       type: "DATA",
//       data: { subject: "test", payload: {}, timestamp: "2024-01-01" },
//     });

//     await waitFor(actor, (state) => state.context.data.length > 0);
//     expect(actor.getSnapshot().context.data).toHaveLength(1);

//     actor.send({ type: "CLEAR" });
//     expect(actor.getSnapshot().context.data).toHaveLength(0);
//   });

//   it("should handle network changes correctly", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));

//     actor.send({ type: "CHANGE_NETWORK", network: "testnet" });

//     await waitFor(
//       actor,
//       (state) => state.matches("idle") && state.context.network === "testnet",
//     );
//     expect(actor.getSnapshot().context.network).toBe("testnet");
//   });

//   it("should handle tab changes correctly", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));

//     actor.send({ type: "CHANGE_TAB", tab: "code" });
//     await waitFor(actor, (state) => state.context.tab === "code");
//     expect(actor.getSnapshot().context.tab).toBe("code");
//   });

//   it("should accumulate stream data correctly", async () => {
//     (Client.connect as any).mockResolvedValue({});
//     const actor = createActor(streamMachine).start();

//     await waitFor(actor, (state) => state.matches("idle"));

//     actor.send({
//       type: "START",
//       subject: "test-subject",
//       selectedModule: "blocks",
//     });

//     await waitFor(actor, (state) => state.matches("subscribing"));

//     const testData = { subject: "test", payload: {}, timestamp: "2024-01-01" };
//     actor.send({ type: "DATA", data: testData });

//     await waitFor(actor, (state) => state.context.data.length > 0);
//     const snapshot = actor.getSnapshot();
//     expect(snapshot.context.data).toHaveLength(1);
//     expect(snapshot.context.data[0]).toEqual(testData);
//   });
// });
