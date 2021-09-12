module.exports = grammar({
    name: 'wgsl',

    extras: $ => [
        $._comment,
        $._space,
    ],

    inline: $ => [
        $.global_decl_or_directive,
        $._reserved,
    ],

    conflicts: $ => [
        [$.array_type_decl],
        [$.type_decl, $.primary_expression],
        [$.type_decl, $.primary_expression, $.func_call_statement],
    ],

    word: $ => $.ident,

    rules: {
        translation_unit: $ => choice(
            seq(optional(repeat($.global_decl_or_directive,)),)
        ),
        global_decl_or_directive: $ => choice(
            seq($.semicolon,),
            seq($.global_variable_decl, $.semicolon,),
            seq($.global_constant_decl, $.semicolon,),
            seq($.type_alias, $.semicolon,),
            seq($.struct_decl, $.semicolon,),
            seq($.function_decl,),
            seq($.enable_directive,)
        ),

        decimal_float_literal: $ => token(/(-?[0-9]*\.[0-9]+|-?[0-9]+\.[0-9]*)((e|E)(\+|-)?[0-9]+)?/),
        hex_float_literal: $ => token(/-?0x([0-9a-fA-F]*\.?[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)(p|P)(\+|-)?[0-9]+/),
        int_literal: $ => token(/-?0x[0-9a-fA-F]+|0|-?[1-9][0-9]*/),
        uint_literal: $ => token(/0x[0-9a-fA-F]+u|0u|[1-9][0-9]*u/),

        const_literal: $ => choice(
            seq($.int_literal,),
            seq($.uint_literal,),
            seq($.float_literal,),
            seq($.true,),
            seq($.false,)
        ),
        float_literal: $ => choice(
            seq($.decimal_float_literal,),
            seq($.hex_float_literal,)
        ),
        attribute_list: $ => choice(
            seq($.attr_left, optional(repeat(seq($.attribute, $.comma,),)), $.attribute, $.attr_right,)
        ),
        attribute: $ => choice(
            seq($.ident, $.paren_left, optional(repeat(seq($.literal_or_ident, $.comma,),)), $.literal_or_ident, $.paren_right,),
            seq($.ident,)
        ),
        literal_or_ident: $ => choice(
            seq($.float_literal,),
            seq($.int_literal,),
            seq($.uint_literal,),
            seq($.ident,)
        ),
        array_type_decl: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.array, $.less_than, $.type_decl, optional(seq($.comma, $.element_count_expression,),), $.greater_than,)
        ),
        element_count_expression: $ => choice(
            seq($.int_literal,),
            seq($.uint_literal,),
            seq($.ident,)
        ),
        struct_decl: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.struct, $.ident, $.struct_body_decl,)
        ),
        struct_body_decl: $ => choice(
            seq($.brace_left, optional(repeat($.struct_member,)), $.brace_right,)
        ),
        struct_member: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.variable_ident_decl, $.semicolon,)
        ),
        access_mode: $ => choice(
            seq($.read,),
            seq($.write,),
            seq($.read_write,)
        ),
        storage_class: $ => choice(
            seq($.function,),
            seq($.private,),
            seq($.workgroup,),
            seq($.uniform,),
            seq($.storage,)
        ),
        texture_sampler_types: $ => choice(
            seq($.sampler_type,),
            seq($.depth_texture_type,),
            seq($.sampled_texture_type, $.less_than, $.type_decl, $.greater_than,),
            seq($.multisampled_texture_type, $.less_than, $.type_decl, $.greater_than,),
            seq($.storage_texture_type, $.less_than, $.texel_format, $.comma, $.access_mode, $.greater_than,)
        ),
        sampler_type: $ => choice(
            seq($.sampler,),
            seq($.sampler_comparison,)
        ),
        sampled_texture_type: $ => choice(
            seq($.texture_1d,),
            seq($.texture_2d,),
            seq($.texture_2d_array,),
            seq($.texture_3d,),
            seq($.texture_cube,),
            seq($.texture_cube_array,)
        ),
        multisampled_texture_type: $ => choice(
            seq($.texture_multisampled_2d,)
        ),
        storage_texture_type: $ => choice(
            seq($.texture_storage_1d,),
            seq($.texture_storage_2d,),
            seq($.texture_storage_2d_array,),
            seq($.texture_storage_3d,)
        ),
        depth_texture_type: $ => choice(
            seq($.texture_depth_2d,),
            seq($.texture_depth_2d_array,),
            seq($.texture_depth_cube,),
            seq($.texture_depth_cube_array,),
            seq($.texture_depth_multisampled_2d,)
        ),
        texel_format: $ => choice(
            seq($.r8unorm,),
            seq($.r8snorm,),
            seq($.r8uint,),
            seq($.r8sint,),
            seq($.r16uint,),
            seq($.r16sint,),
            seq($.r16float,),
            seq($.rg8unorm,),
            seq($.rg8snorm,),
            seq($.rg8uint,),
            seq($.rg8sint,),
            seq($.r32uint,),
            seq($.r32sint,),
            seq($.r32float,),
            seq($.rg16uint,),
            seq($.rg16sint,),
            seq($.rg16float,),
            seq($.rgba8unorm,),
            seq($.rgba8unorm_srgb,),
            seq($.rgba8snorm,),
            seq($.rgba8uint,),
            seq($.rgba8sint,),
            seq($.bgra8unorm,),
            seq($.bgra8unorm_srgb,),
            seq($.rgb10a2unorm,),
            seq($.rg11b10float,),
            seq($.rg32uint,),
            seq($.rg32sint,),
            seq($.rg32float,),
            seq($.rgba16uint,),
            seq($.rgba16sint,),
            seq($.rgba16float,),
            seq($.rgba32uint,),
            seq($.rgba32sint,),
            seq($.rgba32float,)
        ),
        type_alias: $ => choice(
            seq($.type, $.ident, $.equal, $.type_decl,)
        ),
        type_decl: $ => choice(
            seq($.ident,),
            seq($.bool,),
            seq($.float32,),
            seq($.int32,),
            seq($.uint32,),
            seq($.vec2, $.less_than, $.type_decl, $.greater_than,),
            seq($.vec3, $.less_than, $.type_decl, $.greater_than,),
            seq($.vec4, $.less_than, $.type_decl, $.greater_than,),
            seq($.pointer, $.less_than, $.storage_class, $.comma, $.type_decl, optional(seq($.comma, $.access_mode,),), $.greater_than,),
            seq($.array_type_decl,),
            seq($.mat2x2, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat2x3, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat2x4, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat3x2, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat3x3, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat3x4, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat4x2, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat4x3, $.less_than, $.type_decl, $.greater_than,),
            seq($.mat4x4, $.less_than, $.type_decl, $.greater_than,),
            seq($.atomic, $.less_than, $.type_decl, $.greater_than,),
            seq($.texture_sampler_types,)
        ),
        variable_statement: $ => choice(
            seq($.variable_decl,),
            seq($.variable_decl, $.equal, $.short_circuit_or_expression,),
            seq($.let, choice($.ident, $.variable_ident_decl,), $.equal, $.short_circuit_or_expression,)
        ),
        variable_decl: $ => choice(
            seq($.var, optional($.variable_qualifier,), $.variable_ident_decl,)
        ),
        variable_ident_decl: $ => choice(
            seq($.ident, $.colon, optional(repeat($.attribute_list,)), $.type_decl,)
        ),
        variable_qualifier: $ => choice(
            seq($.less_than, $.storage_class, optional(seq($.comma, $.access_mode,),), $.greater_than,)
        ),
        global_variable_decl: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.variable_decl, optional(seq($.equal, $.const_expression,),),)
        ),
        global_constant_decl: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.let, choice($.ident, $.variable_ident_decl,), optional($.global_const_initializer,),)
        ),
        global_const_initializer: $ => choice(
            seq($.equal, $.const_expression,)
        ),
        const_expression: $ => choice(
            seq($.type_decl, $.paren_left, optional(seq(optional(repeat(seq($.const_expression, $.comma,),)), $.const_expression, optional($.comma,),),), $.paren_right,),
            seq($.const_literal,)
        ),
        primary_expression: $ => choice(
            seq($.ident, optional($.argument_expression_list,),),
            seq($.type_decl, $.argument_expression_list,),
            seq($.const_literal,),
            seq($.paren_expression,),
            seq($.bitcast, $.less_than, $.type_decl, $.greater_than, $.paren_expression,)
        ),
        paren_expression: $ => choice(
            seq($.paren_left, $.short_circuit_or_expression, $.paren_right,)
        ),
        argument_expression_list: $ => choice(
            seq($.paren_left, optional(seq(optional(repeat(seq($.short_circuit_or_expression, $.comma,),)), $.short_circuit_or_expression, optional($.comma,),),), $.paren_right,)
        ),
        postfix_expression: $ => choice(
            seq($.bracket_left, $.short_circuit_or_expression, $.bracket_right, optional($.postfix_expression,),),
            seq($.period, $.ident, optional($.postfix_expression,),)
        ),
        unary_expression: $ => choice(
            seq($.singular_expression,),
            seq($.minus, $.unary_expression,),
            seq($.bang, $.unary_expression,),
            seq($.tilde, $.unary_expression,),
            seq($.star, $.unary_expression,),
            seq($.and, $.unary_expression,)
        ),
        singular_expression: $ => choice(
            seq($.primary_expression, optional($.postfix_expression,),)
        ),
        multiplicative_expression: $ => choice(
            seq($.unary_expression,),
            seq($.multiplicative_expression, $.star, $.unary_expression,),
            seq($.multiplicative_expression, $.forward_slash, $.unary_expression,),
            seq($.multiplicative_expression, $.modulo, $.unary_expression,)
        ),
        additive_expression: $ => choice(
            seq($.multiplicative_expression,),
            seq($.additive_expression, $.plus, $.multiplicative_expression,),
            seq($.additive_expression, $.minus, $.multiplicative_expression,)
        ),
        shift_expression: $ => choice(
            seq($.additive_expression,),
            seq($.shift_expression, $.shift_left, $.additive_expression,),
            seq($.shift_expression, $.shift_right, $.additive_expression,)
        ),
        relational_expression: $ => choice(
            seq($.shift_expression,),
            seq($.relational_expression, $.less_than, $.shift_expression,),
            seq($.relational_expression, $.greater_than, $.shift_expression,),
            seq($.relational_expression, $.less_than_equal, $.shift_expression,),
            seq($.relational_expression, $.greater_than_equal, $.shift_expression,)
        ),
        equality_expression: $ => choice(
            seq($.relational_expression,),
            seq($.relational_expression, $.equal_equal, $.relational_expression,),
            seq($.relational_expression, $.not_equal, $.relational_expression,)
        ),
        and_expression: $ => choice(
            seq($.equality_expression,),
            seq($.and_expression, $.and, $.equality_expression,)
        ),
        exclusive_or_expression: $ => choice(
            seq($.and_expression,),
            seq($.exclusive_or_expression, $.xor, $.and_expression,)
        ),
        inclusive_or_expression: $ => choice(
            seq($.exclusive_or_expression,),
            seq($.inclusive_or_expression, $.or, $.exclusive_or_expression,)
        ),
        short_circuit_and_expression: $ => choice(
            seq($.inclusive_or_expression,),
            seq($.short_circuit_and_expression, $.and_and, $.inclusive_or_expression,)
        ),
        short_circuit_or_expression: $ => choice(
            seq($.short_circuit_and_expression,),
            seq($.short_circuit_or_expression, $.or_or, $.short_circuit_and_expression,)
        ),
        compound_statement: $ => choice(
            seq($.brace_left, optional($.statements,), $.brace_right,)
        ),
        assignment_statement: $ => choice(
            seq($.unary_expression, $.equal, $.short_circuit_or_expression,)
        ),
        if_statement: $ => choice(
            seq($.if, $.paren_expression, $.compound_statement, optional($.elseif_statement,), optional($.else_statement,),)
        ),
        elseif_statement: $ => choice(
            seq($.else_if, $.paren_expression, $.compound_statement, optional($.elseif_statement,),)
        ),
        else_statement: $ => choice(
            seq($.else, $.compound_statement,)
        ),
        switch_statement: $ => choice(
            seq($.switch, $.paren_expression, $.brace_left, repeat1($.switch_body,), $.brace_right,)
        ),
        switch_body: $ => choice(
            seq($.case, $.case_selectors, $.colon, $.brace_left, optional($.case_body,), $.brace_right,),
            seq($.default, $.colon, $.brace_left, optional($.case_body,), $.brace_right,)
        ),
        case_selectors: $ => choice(
            seq($.const_literal, optional(repeat(seq($.comma, $.const_literal,),)), optional($.comma,),)
        ),
        case_body: $ => choice(
            seq($.statement, optional($.case_body,),),
            seq($.fallthrough, $.semicolon,)
        ),
        loop_statement: $ => choice(
            seq($.loop, $.brace_left, optional($.statements,), optional($.continuing_statement,), $.brace_right,)
        ),
        for_statement: $ => choice(
            seq($.for, $.paren_left, $.for_header, $.paren_right, $.compound_statement,)
        ),
        for_header: $ => choice(
            seq(optional(choice($.variable_statement, $.assignment_statement, $.func_call_statement,),), $.semicolon, optional($.short_circuit_or_expression,), $.semicolon, optional(choice($.assignment_statement, $.func_call_statement,),),)
        ),
        break_statement: $ => choice(
            seq($.break,)
        ),
        continue_statement: $ => choice(
            seq($.continue,)
        ),
        continuing_statement: $ => choice(
            seq($.continuing, $.compound_statement,)
        ),
        return_statement: $ => choice(
            seq($.return, optional($.short_circuit_or_expression,),)
        ),
        func_call_statement: $ => choice(
            seq($.ident, $.argument_expression_list,)
        ),
        statements: $ => choice(
            seq(repeat1($.statement,),)
        ),
        statement: $ => choice(
            seq($.semicolon,),
            seq($.return_statement, $.semicolon,),
            seq($.if_statement,),
            seq($.switch_statement,),
            seq($.loop_statement,),
            seq($.for_statement,),
            seq($.func_call_statement, $.semicolon,),
            seq($.variable_statement, $.semicolon,),
            seq($.break_statement, $.semicolon,),
            seq($.continue_statement, $.semicolon,),
            seq($.discard, $.semicolon,),
            seq($.assignment_statement, $.semicolon,),
            seq($.compound_statement,)
        ),
        function_decl: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.function_header, $.compound_statement,)
        ),
        function_header: $ => choice(
            seq($.fn, $.ident, $.paren_left, optional($.param_list,), $.paren_right, optional($.function_return_type_decl_optional,),)
        ),
        function_return_type_decl_optional: $ => choice(
            seq($.arrow, optional(repeat($.attribute_list,)), $.type_decl,)
        ),
        param_list: $ => choice(
            seq(optional(repeat(seq($.param, $.comma,),)), $.param, optional($.comma,),)
        ),
        param: $ => choice(
            seq(optional(repeat($.attribute_list,)), $.variable_ident_decl,)
        ),
        enable_directive: $ => choice(
            seq($.enable, $.ident, $.semicolon,)
        ),

        array: $ => token(/array/),
        atomic: $ => token(/atomic/),
        bool: $ => token(/bool/),
        float32: $ => token(/f32/),
        int32: $ => token(/i32/),
        mat2x2: $ => token(/mat2x2/),
        mat2x3: $ => token(/mat2x3/),
        mat2x4: $ => token(/mat2x4/),
        mat3x2: $ => token(/mat3x2/),
        mat3x3: $ => token(/mat3x3/),
        mat3x4: $ => token(/mat3x4/),
        mat4x2: $ => token(/mat4x2/),
        mat4x3: $ => token(/mat4x3/),
        mat4x4: $ => token(/mat4x4/),
        pointer: $ => token(/ptr/),
        sampler: $ => token(/sampler/),
        sampler_comparison: $ => token(/sampler_comparison/),
        struct: $ => token(/struct/),
        texture_1d: $ => token(/texture_1d/),
        texture_2d: $ => token(/texture_2d/),
        texture_2d_array: $ => token(/texture_2d_array/),
        texture_3d: $ => token(/texture_3d/),
        texture_cube: $ => token(/texture_cube/),
        texture_cube_array: $ => token(/texture_cube_array/),
        texture_multisampled_2d: $ => token(/texture_multisampled_2d/),
        texture_storage_1d: $ => token(/texture_storage_1d/),
        texture_storage_2d: $ => token(/texture_storage_2d/),
        texture_storage_2d_array: $ => token(/texture_storage_2d_array/),
        texture_storage_3d: $ => token(/texture_storage_3d/),
        texture_depth_2d: $ => token(/texture_depth_2d/),
        texture_depth_2d_array: $ => token(/texture_depth_2d_array/),
        texture_depth_cube: $ => token(/texture_depth_cube/),
        texture_depth_cube_array: $ => token(/texture_depth_cube_array/),
        texture_depth_multisampled_2d: $ => token(/texture_depth_multisampled_2d/),
        uint32: $ => token(/u32/),
        vec2: $ => token(/vec2/),
        vec3: $ => token(/vec3/),
        vec4: $ => token(/vec4/),
        bitcast: $ => token(/bitcast/),
        block: $ => token(/block/),
        break: $ => token(/break/),
        case: $ => token(/case/),
        continue: $ => token(/continue/),
        continuing: $ => token(/continuing/),
        default: $ => token(/default/),
        discard: $ => token(/discard/),
        else: $ => token(/else/),
        else_if: $ => token(/elseif/),
        enable: $ => token(/enable/),
        fallthrough: $ => token(/fallthrough/),
        false: $ => token(/false/),
        fn: $ => token(/fn/),
        for: $ => token(/for/),
        function: $ => token(/function/),
        if: $ => token(/if/),
        let: $ => token(/let/),
        loop: $ => token(/loop/),
        private: $ => token(/private/),
        read: $ => token(/read/),
        read_write: $ => token(/read_write/),
        return: $ => token(/return/),
        storage: $ => token(/storage/),
        switch: $ => token(/switch/),
        true: $ => token(/true/),
        type: $ => token(/type/),
        uniform: $ => token(/uniform/),
        var: $ => token(/var/),
        workgroup: $ => token(/workgroup/),
        write: $ => token(/write/),
        r8unorm: $ => token(/r8unorm/),
        r8snorm: $ => token(/r8snorm/),
        r8uint: $ => token(/r8uint/),
        r8sint: $ => token(/r8sint/),
        r16uint: $ => token(/r16uint/),
        r16sint: $ => token(/r16sint/),
        r16float: $ => token(/r16float/),
        rg8unorm: $ => token(/rg8unorm/),
        rg8snorm: $ => token(/rg8snorm/),
        rg8uint: $ => token(/rg8uint/),
        rg8sint: $ => token(/rg8sint/),
        r32uint: $ => token(/r32uint/),
        r32sint: $ => token(/r32sint/),
        r32float: $ => token(/r32float/),
        rg16uint: $ => token(/rg16uint/),
        rg16sint: $ => token(/rg16sint/),
        rg16float: $ => token(/rg16float/),
        rgba8unorm: $ => token(/rgba8unorm/),
        rgba8unorm_srgb: $ => token(/rgba8unorm_srgb/),
        rgba8snorm: $ => token(/rgba8snorm/),
        rgba8uint: $ => token(/rgba8uint/),
        rgba8sint: $ => token(/rgba8sint/),
        bgra8unorm: $ => token(/bgra8unorm/),
        bgra8unorm_srgb: $ => token(/bgra8unorm_srgb/),
        rgb10a2unorm: $ => token(/rgb10a2unorm/),
        rg11b10float: $ => token(/rg11b10float/),
        rg32uint: $ => token(/rg32uint/),
        rg32sint: $ => token(/rg32sint/),
        rg32float: $ => token(/rg32float/),
        rgba16uint: $ => token(/rgba16uint/),
        rgba16sint: $ => token(/rgba16sint/),
        rgba16float: $ => token(/rgba16float/),
        rgba32uint: $ => token(/rgba32uint/),
        rgba32sint: $ => token(/rgba32sint/),
        rgba32float: $ => token(/rgba32float/),

        and: $ => token(/\&/),
        and_and: $ => token(/\&\&/),
        arrow: $ => token(/\->/),
        attr_left: $ => token(/\[\[/),
        attr_right: $ => token(/\]\]/),
        forward_slash: $ => token(/\//),
        bang: $ => token(/!/),
        bracket_left: $ => token(/\[/),
        bracket_right: $ => token(/\]/),
        brace_left: $ => token(/\{/),
        brace_right: $ => token(/\}/),
        colon: $ => token(/:/),
        comma: $ => token(/,/),
        equal: $ => token(/=/),
        equal_equal: $ => token(/==/),
        not_equal: $ => token(/!=/),
        greater_than: $ => token(/>/),
        greater_than_equal: $ => token(/>=/),
        shift_right: $ => token(/>>/),
        less_than: $ => token(/</),
        less_than_equal: $ => token(/<=/),
        shift_left: $ => token(/<</),
        modulo: $ => token(/%/),
        minus: $ => token(/\-/),
        minus_minus: $ => token(/\-\-/),
        period: $ => token(/\./),
        plus: $ => token(/\+/),
        plus_plus: $ => token(/\+\+/),
        or: $ => token(/\|/),
        or_or: $ => token(/\|\|/),
        paren_left: $ => token(/\(/),
        paren_right: $ => token(/\)/),
        semicolon: $ => token(/;/),
        star: $ => token(/\*/),
        tilde: $ => token(/\~/),
        xor: $ => token(/\^/),

        _reserved: $ => choice(
            /asm/,
            /bf16/,
            /const/,
            /do/,
            /enum/,
            /f16/,
            /f64/,
            /handle/,
            /i8/,
            /i16/,
            /i64/,
            /mat/,
            /premerge/,
            /regardless/,
            /typedef/,
            /u8/,
            /u16/,
            /u64/,
            /unless/,
            /using/,
            /vec/,
            /void/,
            /while/
        ),

        ident: $ => token(/[a-zA-Z][0-9a-zA-Z_]*/),

        _comment: $ => seq(/\/\//, /.*/),
        _space: $ => /\s/,
    },
});
