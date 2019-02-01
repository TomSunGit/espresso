import { checkIfUserIsAllow } from "./auth";

test("return nothing if user is allowed", () => {
    const logs: string[][] = [];

    const res = checkIfUserIsAllow("a@b.de", "a@b.de,c@d.de", (...l) => logs.push(l));

    expect(res).toBe(undefined);
    expect(logs[0][0]).toBe("Allow a@b.de to access");
});

test("return 401 if user is not allowed", () => {
    const logs: string[][] = [];

    const res = checkIfUserIsAllow("e@f.de", "a@b.de,c@d.de", (...l) => logs.push(l));

    expect(res).toEqual({body: "e@f.de has no permissions to access", status: 401});
    expect(logs[0][0]).toBe("e@f.de has no permissions to access");
});

test("return 401 if no user is not allowed", () => {
    const logs: string[][] = [];

    const res = checkIfUserIsAllow("e@f.de", "", (...l) => logs.push(l));

    expect(res).toEqual({body: "e@f.de has no permissions to access", status: 401});
    expect(logs[0][0]).toBe("e@f.de has no permissions to access");
});

test("return nothing if all users are allowed", () => {
    const logs: string[][] = [];

    const res = checkIfUserIsAllow("e@f.de", undefined, (...l) => logs.push(l));

    expect(res).toBe(undefined);
    expect(logs[0][0]).toBe("No Users configured. Allow everybody.");
});

test("fail if no user principalName is given", () => {
    const logs: string[][] = [];

    const res = checkIfUserIsAllow(undefined, "a@b.de,c@d.de", (...l) => logs.push(l));

    expect(res).toEqual({body: "no auth info found", status: 401});
    expect(logs[0][0]).toBe("no auth info found");
});

test("return nothing if all users are allowed and no principalName is given", () => {
    const logs: string[][] = [];

    const res = checkIfUserIsAllow(undefined, undefined, (...l) => logs.push(l));

    expect(res).toBe(undefined);
    expect(logs[0][0]).toBe("No Users configured. Allow everybody.");
});
