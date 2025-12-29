a parsing function that takes a slice of bytes and returns a structure holding
the results of the parse:

    fn parse_record<'i>(input: &'i [u8]) -> Record<'i> { ... }
