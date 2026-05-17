import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

const AuthRoute = () => {
    const { isAuthenticated, authLoading } = useSelector((state) => state.auth)

    // Show loading spinner while auth check is in progress
    if (authLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        )
    }

    return !isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to={'/dashboard'} />
    )
}

export default AuthRoute