









#ifndef CATCH_USER_CONFIG_HPP_INCLUDED
#define CATCH_USER_CONFIG_HPP_INCLUDED











#if defined( CATCH_CONFIG_ANDROID_LOGWRITE ) && \
    defined( CATCH_CONFIG_NO_ANDROID_LOGWRITE )
#    error Cannot force ANDROID_LOGWRITE to both ON and OFF
#endif




#if defined( CATCH_CONFIG_COLOUR_WIN32 ) && \
    defined( CATCH_CONFIG_NO_COLOUR_WIN32 )
#    error Cannot force COLOUR_WIN32 to be ON and OFF
#endif




#if defined( CATCH_CONFIG_COUNTER ) && \
    defined( CATCH_CONFIG_NO_COUNTER )
#    error Cannot force COUNTER to both ON and OFF
#endif






#if defined( CATCH_CONFIG_CPP11_TO_STRING ) && \
    defined( CATCH_CONFIG_NO_CPP11_TO_STRING )
#    error Cannot force CPP11_TO_STRING to both ON and OFF
#endif






#if defined( CATCH_CONFIG_CPP17_BYTE ) && \
    defined( CATCH_CONFIG_NO_CPP17_BYTE )
#    error Cannot force CPP17_BYTE to both ON and OFF
#endif






#if defined( CATCH_CONFIG_CPP17_OPTIONAL ) && \
    defined( CATCH_CONFIG_NO_CPP17_OPTIONAL )
#    error Cannot force CPP17_OPTIONAL to both ON and OFF
#endif






#if defined( CATCH_CONFIG_CPP17_STRING_VIEW ) && \
    defined( CATCH_CONFIG_NO_CPP17_STRING_VIEW )
#    error Cannot force CPP17_STRING_VIEW to both ON and OFF
#endif






#if defined( CATCH_CONFIG_CPP17_UNCAUGHT_EXCEPTIONS ) && \
    defined( CATCH_CONFIG_NO_CPP17_UNCAUGHT_EXCEPTIONS )
#    error Cannot force CPP17_UNCAUGHT_EXCEPTIONS to both ON and OFF
#endif






#if defined( CATCH_CONFIG_CPP17_VARIANT ) && \
    defined( CATCH_CONFIG_NO_CPP17_VARIANT )
#    error Cannot force CPP17_VARIANT to both ON and OFF
#endif






#if defined( CATCH_CONFIG_GLOBAL_NEXTAFTER ) && \
    defined( CATCH_CONFIG_NO_GLOBAL_NEXTAFTER )
#    error Cannot force GLOBAL_NEXTAFTER to both ON and OFF
#endif






#if defined( CATCH_CONFIG_POSIX_SIGNALS ) && \
    defined( CATCH_CONFIG_NO_POSIX_SIGNALS )
#    error Cannot force POSIX_SIGNALS to both ON and OFF
#endif






#if defined( CATCH_CONFIG_GETENV ) && \
    defined( CATCH_CONFIG_NO_GETENV )
#    error Cannot force GETENV to both ON and OFF
#endif






#if defined( CATCH_CONFIG_USE_ASYNC ) && \
    defined( CATCH_CONFIG_NO_USE_ASYNC )
#    error Cannot force USE_ASYNC to both ON and OFF
#endif






#if defined( CATCH_CONFIG_WCHAR ) && \
    defined( CATCH_CONFIG_NO_WCHAR )
#    error Cannot force WCHAR to both ON and OFF
#endif






#if defined( CATCH_CONFIG_WINDOWS_SEH ) && \
    defined( CATCH_CONFIG_NO_WINDOWS_SEH )
#    error Cannot force WINDOWS_SEH to both ON and OFF
#endif





#if defined( CATCH_CONFIG_EXPERIMENTAL_STATIC_ANALYSIS_SUPPORT ) && \
    defined( CATCH_CONFIG_NO_EXPERIMENTAL_STATIC_ANALYSIS_SUPPORT )
#    error Cannot force STATIC_ANALYSIS_SUPPORT to both ON and OFF
#endif































#define CATCH_CONFIG_DEFAULT_REPORTER "console"
#define CATCH_CONFIG_CONSOLE_WIDTH 80







#endif 
