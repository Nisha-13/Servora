export class ApiResponse {
  static success(res, message = 'Operation successful', data = {}, statusCode = 200, meta = undefined) {
    const payload = {
      success: true,
      message,
      data
    };
    if (meta !== undefined) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static created(res, message = 'Resource created successfully', data = {}) {
    return this.success(res, message, data, 201);
  }

  static error(res, message = 'Something went wrong', statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }
}
