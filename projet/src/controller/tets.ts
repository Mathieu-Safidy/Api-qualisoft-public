import { Request, Response } from "express";



export async function setRouteCapacity(handler: (arg0: any, arg1: any) => any, req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string }): any; new(): any } } }, capacity: any) {
    // Logic de vérification de la capacité
    if (capacity > req.user.capacity) {
        return res.status(401).json({ message: "Forbidden" })
    }
    await handler(req, res)
}

export async function setUserMiddleware(req: any, res: any, next: any) {
    // Get Token
    // Decode Token
    // Get public key from auth microservice (API call to /public-key)
    // Get matricule
    // Get User Capacity from Token (RBAC microservice)
    // API call RBAC microservice to get capacity via matricule
    req.user = {
        matricule: '33381',
        capacity: 3
    }
    next()
}

export const withCapacity = (capacity: number | number[], fn: (req: any, res: any, next?: any) => any) => async (req: any, res: any, next: any) => {
    if (req.user && (typeof capacity == "number" && req.user.capacity >= capacity || Array.isArray(capacity) && capacity.includes(req.user.capacity))) {
        return await fn(req, res, next);
    }
    else {
        return res.status(403).json({ message: "Forbidden" });
    }
}

export function RequireCapacity(capacity: number | number[]) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        descriptor.value = async function (req: any, res: any, next?: any) {
            const userCapacity = req.user?.capacity;
            if (
                typeof capacity === "number"
                    ? userCapacity >= capacity
                    : Array.isArray(capacity) && capacity.includes(userCapacity)
            ) {
                return await original.apply(this, [req, res, next]);
            } else {
                return res.status(403).json({ message: "Forbidden" });
            }
        };
        return descriptor;
    };
}

export const catchAsync = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(async (err) => {
        console.log(err)
        res.status(400).send({ message: err.message })
    });
};

export function capacityMiddleware(capacity: number | number[]) {
    return function (req: any, res: any, next: any) {
        if (req.user && (typeof capacity == "number" && req.user.capacity >= capacity || Array.isArray(capacity) && capacity.includes(req.user.capacity))) {
            next();
        }
        else {
            return res.status(403).json({ message: "Forbidden" });
        }
    }
}
