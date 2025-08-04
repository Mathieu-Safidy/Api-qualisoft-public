export async function setRouteCapacity(handler: (arg0: any, arg1: any) => any, req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string }): any; new(): any } } }, capacity: any) {
    // Logic de vérification de la capacité
    if (capacity > req.user.capacity) {
        return res.status(401).json({ message: "Forbidden" })
    }
    await handler(req, res)
}