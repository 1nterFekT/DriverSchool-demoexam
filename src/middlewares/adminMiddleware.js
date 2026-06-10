export function isAdmin(req, res, next) {
    if (!req.session.admin) {
        return res.redirect("/admin");
    }

    next();
}