<?php

class Response
{
    public static function setJsonHeader()
    {
        header('Content-Type: application/json');
    }

    /**
     * Send success response
     */
    public static function success($data = [], $message = 'Success', $status_code = 200)
    {
        self::setJsonHeader();
        http_response_code($status_code);
        echo json_encode([
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }

    /**
     * Send error response
     */
    public static function error($message = 'Error', $status_code = 400, $data = [])
    {
        self::setJsonHeader();
        http_response_code($status_code);
        echo json_encode([
            'success' => false,
            'status' => 'error',
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }

    /**
     * Send validation error
     */
    public static function validationError($errors = [])
    {
        self::setJsonHeader();
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'status' => 'validation_error',
            'message' => 'Validation failed',
            'errors' => $errors
        ]);
        exit;
    }
}
?>
