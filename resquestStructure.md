**-----------------------------------------------**
                /admin/account
**-----------------------------------------------**
/regsiter
    post:
        body: {userName, email, password, confirm_password}
        return: {message}

/login
    post: 
        body: {email, password}
        return: {user,token}

/register/confirm-email/:activationCode
    post: 
        params: {activationCode}
        return: {message}

/register/resend-email
    post: 
        body: {email}
        return: {message}

/login/forgot-password
    post: 
        body: {email}
        return: {message}

/login/forgot-password/:forgotPasswordCode
    post: 
        params: {forgotPasswordCode}
        body: {password, confirm_password}
        return: {message}

/auth/addAuthToState
    get:
        cookies: {_auth}
        return: {user, token}
    
**-----------------------------------------------**
                /admin/attributes
**-----------------------------------------------**

/
    get:
        return: {data}

/values/:attrId
    post:
        params: {attrId}
        return: {message}
        
/values/:id/:attrId
    delete: 
        params: {id, attrId}
        return: {message}
    patch:
        params: {id, attrId}
        return: {message}
/:id
    get:
        params: {id}
        return: {data}
    delete:
        params: {id}
        return: {message}
    patch:
        params: {id}
        body: {unique_name, public_name, publish}
        return: {message}   
/new
    post:
        userId,
        body: {unique_name, public_name, type, publish, values{name, color}}

**-----------------------------------------------**
                /admin/categories
**-----------------------------------------------**

/
    get:
        return: {data}

/:id
    get:
        params: {id}
        return: {data}
    delete:
        params: {id}
        return: {message}
    patch:
        params: {id}
        body: {name, slug, description, publish, image}
        return: {message}   
/new
    post:
        userId,
        body: {name, slug, description, publish, image}

**-----------------------------------------------**
                /admin/products
**-----------------------------------------------**

/
    get:
        return: {data}

--------------------------------------------------------------
200 Ok
201 Created

400 Bad Request | Form Not Validated
401 Unauthorized
409 Conflict |  email is already used

500 Internal Server Error | Failed to send email