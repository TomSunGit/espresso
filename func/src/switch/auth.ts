export function checkIfUserIsAllow(
    principalName: string | undefined,
    allowedUsers: string | undefined,
    log: (...text: string[]) => void ):
    {body: string, status: number} | undefined {
    if (allowedUsers !== undefined) {
        if (!principalName) {
            const msg = "no auth info found";
            log(msg);
            return {
                body: msg,
                status: 401,
            };
        }
        if (allowedUsers.split(",").includes(principalName)) {
            log(`Allow ${principalName} to access`);
        } else {
            const msg = `${principalName} has no permissions to access`;
            log(msg);
            return {
                body: msg,
                status: 401,
            };
        }
    } else {
        log("No Users configured. Allow everybody.");
    }
}
