package com.jnesis.capacitor.brightcoveplayer.model

import com.google.android.exoplayer2.PlaybackException

data class AudioErrorDetails(
    val message: String,
    val code: Int,
    val type: ErrorType,
    val cause: String? = null
) {
    enum class ErrorType {
        NETWORK_ERROR,
        IO_ERROR,
        TIMEOUT,
        DECODER_ERROR,
        DRM_ERROR,
        UNKNOWN
    }

    companion object {
        fun categorizeErrorCode(errorCode: Int): ErrorType {
            return when (errorCode) {
                PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_FAILED,
                PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT,
                PlaybackException.ERROR_CODE_IO_BAD_HTTP_STATUS -> ErrorType.NETWORK_ERROR

                PlaybackException.ERROR_CODE_IO_UNSPECIFIED,
                PlaybackException.ERROR_CODE_IO_INVALID_HTTP_CONTENT_TYPE,
                PlaybackException.ERROR_CODE_IO_FILE_NOT_FOUND,
                PlaybackException.ERROR_CODE_IO_NO_PERMISSION,
                PlaybackException.ERROR_CODE_IO_CLEARTEXT_NOT_PERMITTED,
                PlaybackException.ERROR_CODE_IO_READ_POSITION_OUT_OF_RANGE -> ErrorType.IO_ERROR

                PlaybackException.ERROR_CODE_TIMEOUT -> ErrorType.TIMEOUT

                in PlaybackException.ERROR_CODE_DECODER_INIT_FAILED..PlaybackException.ERROR_CODE_DECODER_QUERY_FAILED -> ErrorType.DECODER_ERROR

                in PlaybackException.ERROR_CODE_DRM_UNSPECIFIED..PlaybackException.ERROR_CODE_DRM_DISALLOWED_OPERATION -> ErrorType.DRM_ERROR

                else -> ErrorType.UNKNOWN
            }
        }
    }
}
